import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const relationPickerSearchFilterScopedState =
  createComponentState<string>({
    key: 'relationPickerSearchFilterScopedState',
    defaultValue: '',
  });
