import { atomFamily } from 'recoil';

export const relationPickerHoverIndexScopedState = atomFamily<number, string>({
  key: 'relationPickerHoverIndexScopedState',
  default: 0,
});
