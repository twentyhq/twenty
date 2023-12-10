import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const relationPickerSearchFilterScopedState = createScopedState<string>({
  key: 'relationPickerSearchFilterScopedState',
  defaultValue: '',
});
