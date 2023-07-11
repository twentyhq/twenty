import { atom } from 'recoil';

import { INITIAL_HOTKEYS_SCOPE } from '@/hotkeys/constants';
import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';

export const currentHotkeysScopeState = atom<HotkeysScope>({
  key: 'currentHotkeysScopeState',
  default: INITIAL_HOTKEYS_SCOPE,
});
