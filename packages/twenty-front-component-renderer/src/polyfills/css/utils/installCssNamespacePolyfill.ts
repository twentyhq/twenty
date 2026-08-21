import { isDefined } from 'twenty-shared/utils';

import { escapeCssIdentifier } from '@/polyfills/css/utils/escapeCssIdentifier';
import { evaluateCssSupportsQuery } from '@/polyfills/css/utils/evaluateCssSupportsQuery';
import { defineAbsentGlobalScopeValues } from '@/polyfills/utils/defineAbsentGlobalScopeValues';

const CSS_NAMESPACE_POLYFILL = {
  escape: (...escapeArguments: unknown[]) => {
    if (escapeArguments.length === 0) {
      throw new TypeError('CSS.escape requires an argument');
    }

    return escapeCssIdentifier(escapeArguments[0]);
  },
  supports: (...supportsArguments: unknown[]) => {
    if (supportsArguments.length === 0) {
      throw new TypeError('CSS.supports requires an argument');
    }

    try {
      return evaluateCssSupportsQuery(supportsArguments);
    } catch {
      return false;
    }
  },
};

export const installCssNamespacePolyfill = (
  globalScope: Record<string, unknown>,
): void => {
  const nativeCssNamespace = globalScope.CSS;

  // A native namespace, if a browser ever exposes one to workers, wins on both
  // targets: two CSS objects answering the same query differently is worse
  // than no polyfill at all.
  const cssNamespace = isDefined(nativeCssNamespace)
    ? nativeCssNamespace
    : CSS_NAMESPACE_POLYFILL;

  defineAbsentGlobalScopeValues({ globalScope, values: { CSS: cssNamespace } });
};
