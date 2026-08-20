import { createSetTimeoutAnimationFrameScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutAnimationFrameScheduler';
import { installSchedulerPairAliases } from '@/polyfills/window-aliases/utils/installSchedulerPairAliases';

export const installAnimationFrameWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: 'requestAnimationFrame',
    cancelFunctionName: 'cancelAnimationFrame',
    createFallbackSchedulerPair: () =>
      createSetTimeoutAnimationFrameScheduler(globalScope),
  });
};
