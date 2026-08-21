import { createSetTimeoutAnimationFrameScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutAnimationFrameScheduler';
import { createSetTimeoutIdleCallbackScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutIdleCallbackScheduler';
import { installLiveWindowAliases } from '@/polyfills/window-aliases/utils/installLiveWindowAliases';
import { installSchedulerPairAliases } from '@/polyfills/window-aliases/utils/installSchedulerPairAliases';

type InstallWindowAliasesPolyfillInput = {
  globalScope: Record<string, unknown>;
};

export const installWindowAliasesPolyfill = ({
  globalScope,
}: InstallWindowAliasesPolyfillInput): void => {
  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: 'requestAnimationFrame',
    cancelFunctionName: 'cancelAnimationFrame',
    fallbackSchedulerPair: createSetTimeoutAnimationFrameScheduler(),
  });

  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: 'requestIdleCallback',
    cancelFunctionName: 'cancelIdleCallback',
    fallbackSchedulerPair: createSetTimeoutIdleCallbackScheduler(),
  });

  installLiveWindowAliases(globalScope);
};
