import { type Hooks } from '@remote-dom/polyfill';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';

type InstallActiveElementDetachmentHookInput = {
  hooks: Partial<Hooks> | null;
  activeElementStore: WorkerActiveElementStore;
};

export const installActiveElementDetachmentHook = ({
  hooks,
  activeElementStore,
}: InstallActiveElementDetachmentHookInput): void => {
  if (!isDefined(hooks)) {
    throw new CustomError(
      'Worker focus tracking requires DOM mutation hooks',
      'FRONT_COMPONENT_DOM_MUTATION_HOOKS_UNAVAILABLE',
    );
  }

  const previousRemoveChildHook = hooks.removeChild;

  hooks.removeChild = (parent, node, index) => {
    const activeElement = activeElementStore.getActiveElement();

    if (
      isDefined(activeElement) &&
      isAncestorOrSelfOfNode(node, activeElement)
    ) {
      activeElementStore.setActiveElement(null);
    }

    previousRemoveChildHook?.(parent, node, index);
  };
};
