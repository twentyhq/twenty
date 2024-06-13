import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isNavigationSectionOpenComponentState =
  createComponentState<boolean>({
    key: 'isNavigationSectionOpenComponentState',
    defaultValue: true,
  });
