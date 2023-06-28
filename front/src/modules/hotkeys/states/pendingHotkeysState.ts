import { atom } from 'recoil';

export const pendingHotkeyState = atom<string | null>({
  key: 'pendingHotkeyState',
  default: null,
});
