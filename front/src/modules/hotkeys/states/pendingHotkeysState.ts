import { atom } from 'recoil';

export const pendingHotkeyState = atom<string | null>({
  key: 'command-menu/pendingHotkeyState',
  default: null,
});
