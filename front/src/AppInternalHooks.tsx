import { AnalyticsHook } from './sync-hooks/AnalyticsHook';
import { GotoHotkeysHooks } from './sync-hooks/GotoHotkeysHooks';
import { HotkeysScopeAutoSyncHook } from './sync-hooks/HotkeysScopeAutoSyncHook';
import { HotkeysScopeBrowserRouterSync } from './sync-hooks/HotkeysScopeBrowserRouterSync';

export function AppInternalHooks() {
  return (
    <>
      <AnalyticsHook />
      <GotoHotkeysHooks />
      <HotkeysScopeAutoSyncHook />
      <HotkeysScopeBrowserRouterSync />
    </>
  );
}
