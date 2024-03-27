import { createComponentState } from 'twenty-ui';

export const relationPickerSearchFilterScopedState =
  createComponentState<string>({
    key: 'relationPickerSearchFilterScopedState',
    defaultValue: '',
  });
