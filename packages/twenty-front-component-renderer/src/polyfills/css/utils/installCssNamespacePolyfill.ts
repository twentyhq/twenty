import { isDefined } from 'twenty-shared/utils';

import { escapeCssIdentifier } from '@/polyfills/css/utils/escapeCssIdentifier';
import { evaluateCssSupportsQuery } from '@/polyfills/css/utils/evaluateCssSupportsQuery';
import { assertCssArgumentIsStringifiable } from '@/polyfills/css/utils/assertCssArgumentIsStringifiable';
import { defineAbsentGlobalScopeValues } from '@/polyfills/utils/defineAbsentGlobalScopeValues';

const CSS_NAMESPACE_POLYFILL = {
  escape: (...escapeArguments: unknown[]) => {
    if (escapeArguments.length === 0) {
      throw new TypeError('CSS.escape requires an argument');
    }

    assertCssArgumentIsStringifiable({
      functionName: 'escape',
      argument: escapeArguments[0],
    });

    return escapeCssIdentifier(escapeArguments[0]);
  },
  supports: (...supportsArguments: unknown[]) => {
    if (supportsArguments.length === 0) {
      throw new TypeError('CSS.supports requires an argument');
    }

    // Only the arguments the overload reads are coerced, like the native api
    for (const supportsArgument of supportsArguments.slice(0, 2)) {
      assertCssArgumentIsStringifiable({
        functionName: 'supports',
        argument: supportsArgument,
      });
    }

    return evaluateCssSupportsQuery(supportsArguments);
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
