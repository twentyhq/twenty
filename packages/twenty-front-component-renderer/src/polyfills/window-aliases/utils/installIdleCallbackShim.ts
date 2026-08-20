import { createSetTimeoutIdleCallbackScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutIdleCallbackScheduler';
import { installSchedulerPairAliases } from '@/polyfills/window-aliases/utils/installSchedulerPairAliases';

export const installIdleCallbackShim = (
  globalScope: Record<string, unknown>,
): void => {
  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: 'requestIdleCallback',
    cancelFunctionName: 'cancelIdleCallback',
    createFallbackSchedulerPair: createSetTimeoutIdleCallbackScheduler,
  });
};
