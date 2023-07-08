import { AnalyticsHook } from './sync-hooks/AnalyticsHook';
import { GotoHotkeysHooks } from './sync-hooks/GotoHotkeysHooks';
import { HotkeysScopeStackAutoSyncHook } from './sync-hooks/HotkeysScopeStackAutoSyncHook';

export function AppInternalHooks() {
  return (
    <>
      <AnalyticsHook />
      <GotoHotkeysHooks />
      <HotkeysScopeStackAutoSyncHook />
    </>
  );
}
