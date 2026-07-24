import { isObject } from '@sniptt/guards';

export const resolveGlobalScopeInstallTargets = (
  globalScope: Record<string, unknown>,
): Record<string, unknown>[] => {
  const polyfillWindow = globalScope.window;

  if (isObject(polyfillWindow) && polyfillWindow !== globalScope) {
    return [globalScope, polyfillWindow as Record<string, unknown>];
  }

  return [globalScope];
};
