import { atom } from 'recoil';

import { INITIAL_HOTKEYS_SCOPE } from '../../constants';
import { HotkeyScope } from '../../types/HotkeyScope';

export const currentHotkeysScopeState = atom<HotkeyScope>({
  key: 'currentHotkeysScopeState',
  default: INITIAL_HOTKEYS_SCOPE,
});
