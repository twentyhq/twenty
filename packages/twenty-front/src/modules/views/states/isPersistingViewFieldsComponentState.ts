import { createComponentState } from 'twenty-ui';

export const isPersistingViewFieldsComponentState =
  createComponentState<boolean>({
    key: 'isPersistingViewFieldsComponentState',
    defaultValue: false,
  });
