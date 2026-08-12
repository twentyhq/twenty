import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { createStorageFromFrontComponentStorageBridge } from '@/polyfills/storage/utils/createStorageFromFrontComponentStorageBridge';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type FrontComponentStorageBridge } from '@/types/FrontComponentStorageBridge';

export const installStorageShims = ({
  globalScope,
  storageBridges,
}: {
  globalScope: Record<string, unknown>;
  storageBridges: Record<
    FrontComponentStorageType,
    FrontComponentStorageBridge
  >;
}): void => {
  const localStorage = createStorageFromFrontComponentStorageBridge(
    storageBridges.localStorage,
  );
  const sessionStorage = createStorageFromFrontComponentStorageBridge(
    storageBridges.sessionStorage,
  );

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.localStorage = localStorage;
    installTarget.sessionStorage = sessionStorage;
  }
};
