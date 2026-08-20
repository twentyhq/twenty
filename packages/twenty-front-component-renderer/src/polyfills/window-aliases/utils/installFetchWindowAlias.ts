import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';

export const installFetchWindowAlias = (
  globalScope: Record<string, unknown>,
): void => {
  // Resolved at call time so the alias reaches a host fetch proxy installed later
  const delegateToCurrentGlobalFetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const currentGlobalFetch = globalScope.fetch;

    if (!isFunction(currentGlobalFetch)) {
      return Promise.reject(
        new TypeError('fetch is not available in this environment'),
      );
    }

    return currentGlobalFetch.call(globalScope, input, init);
  };

  const polyfillWindow = resolvePolyfillWindow(globalScope);

  if (isDefined(polyfillWindow) && !('fetch' in polyfillWindow)) {
    polyfillWindow.fetch = delegateToCurrentGlobalFetch;
  }
};
