import { atom } from 'recoil';

import { INITIAL_HOTKEYS_SCOPE } from '@/lib/hotkeys/constants';
import { HotkeysScope } from '@/lib/hotkeys/types/HotkeysScope';

export const currentHotkeysScopeState = atom<HotkeysScope>({
  key: 'currentHotkeysScopeState',
  default: INITIAL_HOTKEYS_SCOPE,
});
