import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { localStorageEffect } from '~/utils/recoil-effects';

export const isNavigationSectionOpenComponentState =
  createComponentState<boolean>({
    key: 'isNavigationSectionOpenComponentState',
    defaultValue: true,
    effects: [localStorageEffect()],
  });
