import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const relationPickerSearchFilterScopedState =
  createStateScopeMap<string>({
    key: 'relationPickerSearchFilterScopedState',
    defaultValue: '',
  });
