import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { NODE_FILTER } from '@/polyfills/dom/constants/NodeFilter';
import { createWorkerTextTreeWalker } from '@/polyfills/dom/utils/createWorkerTextTreeWalker';
import { resolvePolyfillDocument } from '@/polyfills/dom/utils/resolvePolyfillDocument';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

export const installTextTreeWalkerPolyfill = ({
  globalScope,
}: {
  globalScope: Record<string, unknown>;
}): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);
  const documentTarget = resolvePolyfillDocument(installTargets);

  if (
    !isDefined(documentTarget) ||
    isFunction(documentTarget.createTreeWalker)
  ) {
    return;
  }

  for (const installTarget of installTargets) {
    if (!isDefined(installTarget.NodeFilter)) {
      installTarget.NodeFilter = NODE_FILTER;
    }
  }

  documentTarget.createTreeWalker = (
    ...[root, whatToShow, filter]: Parameters<Document['createTreeWalker']>
  ) => {
    if (whatToShow !== NODE_FILTER.SHOW_TEXT || isDefined(filter)) {
      throw new TypeError(
        'Worker TreeWalker supports SHOW_TEXT without a callback filter',
      );
    }

    return createWorkerTextTreeWalker(root);
  };
};
