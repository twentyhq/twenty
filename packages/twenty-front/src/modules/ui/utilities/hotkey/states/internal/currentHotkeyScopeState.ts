import { atom } from 'recoil';

import { INITIAL_HOTKEYS_SCOPE } from '../../constants';
import { HotkeyScope } from '../../types/HotkeyScope';

export const currentHotkeyScopeState = atom<HotkeyScope>({
  key: 'currentHotkeyScopeState',
  default: INITIAL_HOTKEYS_SCOPE,
});
