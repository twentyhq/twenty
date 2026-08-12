import { type FrontComponentStorageType } from 'twenty-sdk/front-component';

import { createStorageFromFrontComponentStorageBridge } from '@/polyfills/storage/utils/createStorageFromFrontComponentStorageBridge';
import { type FrontComponentStorageBridge } from '@/polyfills/storage/types/FrontComponentStorageBridge';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallStorageBridgeInput = {
  globalScope: Record<string, unknown>;
  storageBridges: Record<
    FrontComponentStorageType,
    FrontComponentStorageBridge
  >;
};

export const installStorageBridge = ({
  globalScope,
  storageBridges,
}: InstallStorageBridgeInput): void => {
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
