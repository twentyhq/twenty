import { isDefined } from 'twenty-shared/utils';

import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';

export const resolveGlobalScopeInstallTargets = (
  globalScope: Record<string, unknown>,
): Record<string, unknown>[] => {
  const polyfillWindow = resolvePolyfillWindow(globalScope);

  if (isDefined(polyfillWindow)) {
    return [globalScope, polyfillWindow];
  }

  return [globalScope];
};
