import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';
import { createSetTimeoutAnimationFrameScheduler } from '@/polyfills/window-aliases/utils/createSetTimeoutAnimationFrameScheduler';

export const installAnimationFrameWindowAliases = (
  globalScope: Record<string, unknown>,
): void => {
  const nativeRequestAnimationFrame = globalScope.requestAnimationFrame;
  const nativeCancelAnimationFrame = globalScope.cancelAnimationFrame;

  const hasNativeAnimationFrameScheduler =
    isFunction(nativeRequestAnimationFrame) &&
    isFunction(nativeCancelAnimationFrame);

  const animationFrameScheduler: AnimationFrameScheduler =
    hasNativeAnimationFrameScheduler
      ? {
          requestAnimationFrame: nativeRequestAnimationFrame.bind(globalScope),
          cancelAnimationFrame: nativeCancelAnimationFrame.bind(globalScope),
        }
      : createSetTimeoutAnimationFrameScheduler();

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (
      'requestAnimationFrame' in installTarget &&
      'cancelAnimationFrame' in installTarget
    ) {
      continue;
    }

    installTarget.requestAnimationFrame =
      animationFrameScheduler.requestAnimationFrame;
    installTarget.cancelAnimationFrame =
      animationFrameScheduler.cancelAnimationFrame;
  }
};
