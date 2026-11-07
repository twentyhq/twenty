import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

const WINDOW_SCROLL_METHOD_NAMES = ['scrollTo', 'scroll', 'scrollBy'];

export const installWindowScrollPolyfill = ({
  globalScope,
}: {
  globalScope: Record<string, unknown>;
}): void => {
  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const methodName of WINDOW_SCROLL_METHOD_NAMES) {
      definePolyfillMethod({
        target: installTarget,
        methodName,
        method: () => undefined,
      });
    }
  }
};
