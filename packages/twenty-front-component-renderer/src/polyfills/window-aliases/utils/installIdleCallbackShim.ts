import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';
import { createSetTimeoutIdleCallbackScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutIdleCallbackScheduler';

export const installIdleCallbackShim = (
  globalScope: Record<string, unknown>,
): void => {
  const nativeRequestIdleCallback = globalScope.requestIdleCallback;
  const nativeCancelIdleCallback = globalScope.cancelIdleCallback;

  const hasNativeIdleCallbackScheduler =
    isFunction(nativeRequestIdleCallback) &&
    isFunction(nativeCancelIdleCallback);

  const idleCallbackScheduler: IdleCallbackScheduler =
    hasNativeIdleCallbackScheduler
      ? {
          requestIdleCallback: nativeRequestIdleCallback.bind(globalScope),
          cancelIdleCallback: nativeCancelIdleCallback.bind(globalScope),
        }
      : createSetTimeoutIdleCallbackScheduler();

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (
      'requestIdleCallback' in installTarget &&
      'cancelIdleCallback' in installTarget
    ) {
      continue;
    }

    installTarget.requestIdleCallback =
      idleCallbackScheduler.requestIdleCallback;
    installTarget.cancelIdleCallback = idleCallbackScheduler.cancelIdleCallback;
  }
};
