import { atomFamily } from 'recoil';

export const relationPickerHoveredIdScopedState = atomFamily<string, string>({
  key: 'relationPickerHoveredIdScopedState',
  default: (param) => param,
});
