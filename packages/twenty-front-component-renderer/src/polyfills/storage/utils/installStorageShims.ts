import { createInMemoryStorage } from '@/polyfills/storage/utils/createInMemoryStorage';
import { createStorageFromLocalStorageBridge } from '@/polyfills/storage/utils/createStorageFromLocalStorageBridge';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type FrontComponentLocalStorageWorkerBridge } from '@/types/FrontComponentLocalStorageWorkerBridge';

export const installStorageShims = ({
  globalScope,
  localStorageBridge,
}: {
  globalScope: Record<string, unknown>;
  localStorageBridge: FrontComponentLocalStorageWorkerBridge;
}): void => {
  const localStorage = createStorageFromLocalStorageBridge(localStorageBridge);
  const sessionStorage = createInMemoryStorage();

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.localStorage = localStorage;
    installTarget.sessionStorage = sessionStorage;
  }
};
