import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { NODE_FILTER } from '@/polyfills/dom/constants/NodeFilter';
import { type WorkerTextTreeWalker } from '@/polyfills/dom/types/WorkerTextTreeWalker';
import { createWorkerTextTreeWalker } from '@/polyfills/dom/utils/createWorkerTextTreeWalker';
import { resolvePolyfillDocument } from '@/polyfills/dom/utils/resolvePolyfillDocument';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallTextTreeWalkerPolyfillInput = {
  globalScope: Record<string, unknown>;
};

export const installTextTreeWalkerPolyfill = ({
  globalScope,
}: InstallTextTreeWalkerPolyfillInput): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);
  const documentTarget = resolvePolyfillDocument(installTargets);

  if (!isDefined(documentTarget)) {
    return;
  }

  if (isFunction(documentTarget.createTreeWalker)) {
    return;
  }

  for (const installTarget of installTargets) {
    if (!isDefined(installTarget.NodeFilter)) {
      installTarget.NodeFilter = NODE_FILTER;
    }
  }

  documentTarget.createTreeWalker = (
    root: Node,
    whatToShow?: number,
    filter?: NodeFilter | null,
  ): WorkerTextTreeWalker => {
    const isUnsupportedTreeWalkerConfiguration =
      whatToShow !== NODE_FILTER.SHOW_TEXT || isDefined(filter);

    if (isUnsupportedTreeWalkerConfiguration) {
      throw new TypeError(
        'Worker TreeWalker supports SHOW_TEXT without a callback filter',
      );
    }

    return createWorkerTextTreeWalker(root);
  };
};
