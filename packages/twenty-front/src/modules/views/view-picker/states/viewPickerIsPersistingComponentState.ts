import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const viewPickerIsPersistingComponentState =
  createComponentState<boolean>({
    key: 'viewPickerIsPersistingComponentState',
    defaultValue: false,
  });
