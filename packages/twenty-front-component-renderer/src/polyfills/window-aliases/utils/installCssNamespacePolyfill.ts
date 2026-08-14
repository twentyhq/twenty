import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { escapeCssIdentifier } from '@/polyfills/window-aliases/utils/escapeCssIdentifier';
import { evaluateCssSupportsQuery } from '@/polyfills/window-aliases/utils/evaluateCssSupportsQuery';

export const installCssNamespacePolyfill = (
  globalScope: Record<string, unknown>,
): void => {
  const cssNamespace = {
    escape: (...escapeArguments: unknown[]) => {
      if (escapeArguments.length === 0) {
        throw new TypeError('CSS.escape requires an argument');
      }

      return escapeCssIdentifier(escapeArguments[0]);
    },
    supports: (...supportsArguments: unknown[]) => {
      try {
        return evaluateCssSupportsQuery(supportsArguments);
      } catch {
        return false;
      }
    },
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (!('CSS' in installTarget)) {
      installTarget.CSS = cssNamespace;
    }
  }
};
