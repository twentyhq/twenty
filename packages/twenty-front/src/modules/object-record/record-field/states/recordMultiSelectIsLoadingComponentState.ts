import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordMultiSelectIsLoadingComponentState =
  createComponentState<boolean>({
    key: 'recordMultiSelectIsLoadingComponentState',
    defaultValue: false,
  });
