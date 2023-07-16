import { AnalyticsHook } from './AnalyticsHook';
import { GotoHotkeysHooks } from './GotoHotkeysHooks';
import { HotkeyScopeAutoSyncHook } from './HotkeyScopeAutoSyncHook';
import { HotkeyScopeBrowserRouterSync } from './HotkeyScopeBrowserRouterSync';

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
