import { atomFamily } from 'recoil';

export const relationPickerHoverIdScopedState = atomFamily<string, string>({
  key: 'relationPickerHoverIdScopedState',
  default: (param) => param,
});
