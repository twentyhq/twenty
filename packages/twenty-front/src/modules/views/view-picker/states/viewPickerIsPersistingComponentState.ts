import { createComponentState } from 'twenty-ui';

export const viewPickerIsPersistingComponentState =
  createComponentState<boolean>({
    key: 'viewPickerIsPersistingComponentState',
    defaultValue: false,
  });
