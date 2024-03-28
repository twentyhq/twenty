import { createComponentState } from 'twenty-ui';

export const viewPickerSelectedIconComponentState =
  createComponentState<string>({
    key: 'viewPickerSelectedIconComponentState',
    defaultValue: '',
  });
