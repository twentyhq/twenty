import { AnalyticsHook } from './sync-hooks/AnalyticsHook';
import { GotoHotkeysHooks } from './sync-hooks/GotoHotkeysHooks';
import { HotkeysScopeBrowserRouterSync } from './sync-hooks/HotkeysScopeBrowserRouterSync';
import { HotkeysScopeStackAutoSyncHook } from './sync-hooks/HotkeysScopeStackAutoSyncHook';

export function AppInternalHooks() {
  return (
    <>
      <AnalyticsHook />
      <GotoHotkeysHooks />
      <HotkeysScopeStackAutoSyncHook />
      <HotkeysScopeBrowserRouterSync />
    </>
  );
}
