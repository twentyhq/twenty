import { createComponentState } from 'twenty-ui';

export const isObjectFilterDropdownUnfoldedComponentState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownUnfoldedScopedState',
    defaultValue: false,
  });
