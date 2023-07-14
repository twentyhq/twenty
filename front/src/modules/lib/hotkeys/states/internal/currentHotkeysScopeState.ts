import { atom } from 'recoil';

import { INITIAL_HOTKEYS_SCOPE } from '../../constants';
import { HotkeysScope } from '../../types/HotkeysScope';

export const currentHotkeysScopeState = atom<HotkeysScope>({
  key: 'currentHotkeysScopeState',
  default: INITIAL_HOTKEYS_SCOPE,
});
