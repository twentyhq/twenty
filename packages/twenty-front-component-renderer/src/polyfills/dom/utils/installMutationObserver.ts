import { isDefined } from 'twenty-shared/utils';

import { MUTATION_OBSERVER_HOOKS_UNAVAILABLE_ERROR } from '@/polyfills/dom/errors/MutationObserverHooksUnavailableError';
import { createMutationObserverClass } from '@/polyfills/dom/utils/createMutationObserverClass';
import { createMutationObserverRegistry } from '@/polyfills/dom/utils/createMutationObserverRegistry';
import { installMutationRecordHooks } from '@/polyfills/dom/utils/installMutationRecordHooks';
import { resolvePolyfillDocument } from '@/polyfills/dom/utils/resolvePolyfillDocument';
import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';

type InstallMutationObserverInput = {
  globalScope: Record<string, unknown>;
};

export const installMutationObserver = ({
  globalScope,
}: InstallMutationObserverInput): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);
  const hooks = resolvePolyfillHooks(installTargets);

  if (!isDefined(hooks)) {
    console.error(MUTATION_OBSERVER_HOOKS_UNAVAILABLE_ERROR);
    return;
  }

  const registry = createMutationObserverRegistry();

  installMutationRecordHooks({
    hooks,
    registry,
    documentTarget: resolvePolyfillDocument(installTargets),
  });

  const polyfillWindow = resolvePolyfillWindow(globalScope);

  const MutationObserverImplementation = createMutationObserverClass({
    registry,
    reportCallbackError: (error) =>
      reportErrorToPolyfillWindow({ polyfillWindow, error }),
  });

  for (const installTarget of installTargets) {
    installTarget.MutationObserver = MutationObserverImplementation;
  }
};
