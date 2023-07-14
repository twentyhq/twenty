import { AnalyticsHook } from './sync-hooks/AnalyticsHook';
import { GotoHotkeysHooks } from './sync-hooks/GotoHotkeysHooks';
import { HotkeyScopeAutoSyncHook } from './sync-hooks/HotkeyScopeAutoSyncHook';
import { HotkeyScopeBrowserRouterSync } from './sync-hooks/HotkeyScopeBrowserRouterSync';

export function AppInternalHooks() {
  return (
    <>
      <AnalyticsHook />
      <GotoHotkeysHooks />
      <HotkeyScopeAutoSyncHook />
      <HotkeyScopeBrowserRouterSync />
    </>
  );
}
