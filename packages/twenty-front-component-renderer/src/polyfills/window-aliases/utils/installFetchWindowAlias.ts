import { isFunction } from '@sniptt/guards';

import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

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
      throw new TypeError('fetch is not available in this environment');
    }

    return currentGlobalFetch.call(globalScope, input, init);
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    const isGlobalScopeTarget = installTarget === globalScope;
    const targetAlreadyHasFetch = 'fetch' in installTarget;

    if (isGlobalScopeTarget || targetAlreadyHasFetch) {
      continue;
    }

    installTarget.fetch = delegateToCurrentGlobalFetch;
  }
};
