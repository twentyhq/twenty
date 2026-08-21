import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type SchedulerPair } from '@/polyfills/window-aliases/types/SchedulerPair';

type InstallSchedulerPairAliasesInput = {
  globalScope: Record<string, unknown>;
  requestFunctionName: string;
  cancelFunctionName: string;
  fallbackSchedulerPair: SchedulerPair;
};

export const installSchedulerPairAliases = ({
  globalScope,
  requestFunctionName,
  cancelFunctionName,
  fallbackSchedulerPair,
}: InstallSchedulerPairAliasesInput): void => {
  const nativeRequest = globalScope[requestFunctionName];
  const nativeCancel = globalScope[cancelFunctionName];

  const schedulerPair: SchedulerPair =
    isFunction(nativeRequest) && isFunction(nativeCancel)
      ? {
          request: nativeRequest.bind(globalScope),
          cancel: nativeCancel.bind(globalScope),
        }
      : fallbackSchedulerPair;

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    // A target holding half of the pair keeps it: overwriting a working native
    // request with a fallback would downgrade it to a timer.
    if (
      requestFunctionName in installTarget ||
      cancelFunctionName in installTarget
    ) {
      continue;
    }

    installTarget[requestFunctionName] = schedulerPair.request;
    installTarget[cancelFunctionName] = schedulerPair.cancel;
  }
};
