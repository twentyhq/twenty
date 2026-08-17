import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

export const installFetchWindowAlias = (
  globalScope: Record<string, unknown>,
): void => {
  const delegateToCurrentGlobalFetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const currentGlobalFetch = globalScope.fetch;

    if (!isFunction(currentGlobalFetch)) {
      throw new TypeError('fetch is not available in this environment');
    }

    return currentGlobalFetch.call(globalScope, input, init);
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    if (installTarget === globalScope || 'fetch' in installTarget) {
      continue;
    }

    installTarget.fetch = delegateToCurrentGlobalFetch;
  }
};
