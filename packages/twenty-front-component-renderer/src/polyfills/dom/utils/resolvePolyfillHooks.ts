import { HOOKS, type Hooks } from '@remote-dom/polyfill';
import { isObject } from '@sniptt/guards';

export const resolvePolyfillHooks = (
  installTargets: Record<string, unknown>[],
): Partial<Hooks> | null => {
  for (const installTarget of installTargets) {
    const hooks = (installTarget as Record<symbol, unknown>)[HOOKS];

    if (isObject(hooks)) {
      return hooks as Partial<Hooks>;
    }
  }

  return null;
};
