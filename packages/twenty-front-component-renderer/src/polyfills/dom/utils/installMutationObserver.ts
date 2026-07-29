import { isDefined } from 'twenty-shared/utils';

import { createMutationObserverClass } from '@/polyfills/dom/utils/createMutationObserverClass';
import { createMutationObserverRegistry } from '@/polyfills/dom/utils/createMutationObserverRegistry';
import { installMutationRecordHooks } from '@/polyfills/dom/utils/installMutationRecordHooks';
import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallMutationObserverInput = {
  globalScope: Record<string, unknown>;
};

export const installMutationObserver = ({
  globalScope,
}: InstallMutationObserverInput): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);
  const hooks = resolvePolyfillHooks(installTargets);

  if (!isDefined(hooks)) {
    return;
  }

  const registry = createMutationObserverRegistry();

  installMutationRecordHooks({ hooks, registry });

  const MutationObserverImplementation = createMutationObserverClass({
    registry,
  });

  for (const installTarget of installTargets) {
    installTarget.MutationObserver = MutationObserverImplementation;
  }
};
