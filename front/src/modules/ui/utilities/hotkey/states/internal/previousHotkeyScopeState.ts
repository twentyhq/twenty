import { atom } from 'recoil';

import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = atom<HotkeyScope | null>({
  key: 'previousHotkeyScopeState',
  default: null,
});
