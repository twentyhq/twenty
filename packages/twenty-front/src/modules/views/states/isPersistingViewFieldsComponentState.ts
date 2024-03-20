import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isPersistingViewFieldsComponentState =
  createComponentState<boolean>({
    key: 'isPersistingViewFieldsComponentState',
    defaultValue: false,
  });
