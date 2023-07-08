import { Keys } from 'react-hotkeys-hook/dist/types';
import { atom } from 'recoil';

export const pendingHotkeyState = atom<Keys | null>({
  key: 'pendingHotkeyState',
  default: null,
});
