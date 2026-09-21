import { isObject } from '@sniptt/guards';

export const resolvePolyfillWindow = (
  globalScope: Record<string, unknown>,
): Record<string, unknown> | null => {
  const polyfillWindow = globalScope.window;

  if (!isObject(polyfillWindow) || polyfillWindow === globalScope) {
    return null;
  }

  return polyfillWindow as Record<string, unknown>;
};
