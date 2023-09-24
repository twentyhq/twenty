import { atomFamily } from 'recoil';

export const relationPickerPreselectedIdScopedState = atomFamily<
  string,
  string
>({
  key: 'relationPickerPreselectedIdScopedState',
  default: (param) => param,
});
