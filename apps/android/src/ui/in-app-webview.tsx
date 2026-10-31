// 应用内的网页浏览器：把门户的账本/设备页面直接塞进 App，不留任何浏览器痕迹。
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { WebView } from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing, type as typography } from './theme'
import { useTheme } from './theme-context'

type Target = { url: string; title: string } | null

let setTarget: ((t: Target) => void) | null = null

/** 打开应用内网页。页面由 <InAppWebViewHost /> 统一渲染。 */
export function openInAppWebView(url: string, title: string): void {
  setTarget?.({ url, title })
}

export function InAppWebViewHost() {
  const [target, setLocal] = useState<Target>(null)
  const insets = useSafeAreaInsets()
  const { colors } = useTheme()

  useEffect(() => {
    setTarget = setLocal
    return () => { setTarget = null }
  }, [])

  const close = useCallback(() => setLocal(null), [])
  if (!target) return null

  return (
    <Modal animationType="slide" visible onRequestClose={close} presentationStyle="fullScreen">
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.bar, { borderBottomColor: colors.separator }]}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.ink }]}>{target.title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="关闭" onPress={close} hitSlop={12} style={styles.closeBtn}>
            <X size={18} color={colors.ink} />
          </Pressable>
        </View>
        <WebView
          source={{ uri: target.url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.muted} />
            </View>
          )}
          style={styles.web}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { flex: 1, ...typography.bodyStrong },
  closeBtn: { padding: spacing.xs },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  web: { flex: 1 },
})
