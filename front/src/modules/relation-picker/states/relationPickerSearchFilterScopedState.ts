import { atomFamily } from 'recoil';

export const relationPickerSearchFilterScopedState = atomFamily<string, string>(
  {
    key: 'relationPickerSearchFilterScopedState',
    default: '',
  },
);
