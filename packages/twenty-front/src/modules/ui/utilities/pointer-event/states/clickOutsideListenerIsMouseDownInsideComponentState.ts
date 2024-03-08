import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const clickOutsideListenerIsMouseDownInsideComponentState =
  createComponentState<boolean>({
    key: 'clickOutsideListenerIsMouseDownInsideComponentState',
    defaultValue: false,
  });
