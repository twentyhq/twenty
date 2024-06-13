import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const isNavigationSectionOpenComponentState = ({
  scopeId,
}: ComponentStateKey) => {
  return createComponentState<boolean>({
    key: 'isNavigationSectionOpenComponentState',
    defaultValue: true,
    effects: [
      localStorageEffect('isNavigationSectionOpenComponentState' + scopeId),
    ],
  })({ scopeId });
};
