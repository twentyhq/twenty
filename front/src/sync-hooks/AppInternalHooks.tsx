import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { isInitializingHotkeyScopeState } from '../modules/ui/states/isInitializingHotkeyScopeState';

import { AnalyticsHook } from './AnalyticsHook';
import { GotoHotkeysHooks } from './GotoHotkeysHooks';
import { HotkeyScopeAutoSyncHook } from './HotkeyScopeAutoSyncHook';
import { HotkeyScopeBrowserRouterSync } from './HotkeyScopeBrowserRouterSync';

export function AppInternalHooks() {
  return (
    <>
      {/* <AnalyticsHook /> */}
      {/* <HotkeyScopeBrowserRouterSync /> */}
      {/* <HotkeyScopeAutoSyncHook /> */}
      <GotoHotkeysHooks />
    </>
  );
}
