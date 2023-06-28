import { atom } from 'recoil';

export const captureHotkeyTypeInFocusState = atom<boolean>({
  key: 'captureHotkeyTypeInFocusState',
  default: false,
});
