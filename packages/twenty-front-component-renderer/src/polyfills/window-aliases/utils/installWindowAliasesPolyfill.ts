import { createSetTimeoutAnimationFrameScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutAnimationFrameScheduler';
import { createSetTimeoutIdleCallbackScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutIdleCallbackScheduler';
import { installFetchWindowAlias } from '@/polyfills/window-aliases/utils/installFetchWindowAlias';
import { installNativeWindowAliases } from '@/polyfills/window-aliases/utils/installNativeWindowAliases';
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
    createFallbackSchedulerPair: () =>
      createSetTimeoutAnimationFrameScheduler(globalScope),
  });

  installFetchWindowAlias(globalScope);
  installNativeWindowAliases(globalScope);

  installSchedulerPairAliases({
    globalScope,
    requestFunctionName: 'requestIdleCallback',
    cancelFunctionName: 'cancelIdleCallback',
    createFallbackSchedulerPair: createSetTimeoutIdleCallbackScheduler,
  });
};
