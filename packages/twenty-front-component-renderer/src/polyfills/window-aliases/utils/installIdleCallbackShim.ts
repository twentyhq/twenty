import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';
import { createSetTimeoutIdleCallbackScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutIdleCallbackScheduler';

export const installIdleCallbackShim = (
  globalScope: Record<string, unknown>,
): void => {
  const nativeRequestIdleCallback = globalScope.requestIdleCallback;
  const nativeCancelIdleCallback = globalScope.cancelIdleCallback;

  const idleCallbackScheduler: IdleCallbackScheduler =
    isFunction(nativeRequestIdleCallback) &&
    isFunction(nativeCancelIdleCallback)
      ? {
          requestIdleCallback: (callback, options) =>
            nativeRequestIdleCallback.call(
              globalScope,
              callback,
              options,
            ) as number,
          cancelIdleCallback: (idleCallbackHandle) => {
            nativeCancelIdleCallback.call(globalScope, idleCallbackHandle);
          },
        }
      : createSetTimeoutIdleCallbackScheduler();

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (!('requestIdleCallback' in installTarget)) {
      installTarget.requestIdleCallback =
        idleCallbackScheduler.requestIdleCallback;
    }

    if (!('cancelIdleCallback' in installTarget)) {
      installTarget.cancelIdleCallback =
        idleCallbackScheduler.cancelIdleCallback;
    }
  }
};
