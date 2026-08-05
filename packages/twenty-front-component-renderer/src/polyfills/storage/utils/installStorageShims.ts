import { type FrontComponentStorageArea } from 'twenty-sdk/front-component';

import { createStorageFromStorageBridge } from '@/polyfills/storage/utils/createStorageFromStorageBridge';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type FrontComponentStorageWorkerBridge } from '@/types/FrontComponentStorageWorkerBridge';

export const installStorageShims = ({
  globalScope,
  storageBridges,
}: {
  globalScope: Record<string, unknown>;
  storageBridges: Record<
    FrontComponentStorageArea,
    FrontComponentStorageWorkerBridge
  >;
}): void => {
  const localStorage = createStorageFromStorageBridge(storageBridges.local);
  const sessionStorage = createStorageFromStorageBridge(storageBridges.session);

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.localStorage = localStorage;
    installTarget.sessionStorage = sessionStorage;
  }
};
