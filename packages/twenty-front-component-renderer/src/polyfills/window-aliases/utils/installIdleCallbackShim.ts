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
          requestIdleCallback: (callback, options) =>
            nativeRequestIdleCallback.call(globalScope, callback, options),
          cancelIdleCallback: (idleCallbackHandle) => {
            nativeCancelIdleCallback.call(globalScope, idleCallbackHandle);
          },
        }
      : createSetTimeoutIdleCallbackScheduler();

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    const targetAlreadyHasRequestIdleCallback =
      'requestIdleCallback' in installTarget;
    const targetAlreadyHasCancelIdleCallback =
      'cancelIdleCallback' in installTarget;

    if (!targetAlreadyHasRequestIdleCallback) {
      installTarget.requestIdleCallback =
        idleCallbackScheduler.requestIdleCallback;
    }

    if (!targetAlreadyHasCancelIdleCallback) {
      installTarget.cancelIdleCallback =
        idleCallbackScheduler.cancelIdleCallback;
    }
  }
};
