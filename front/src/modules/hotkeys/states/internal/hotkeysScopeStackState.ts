import { atom } from 'recoil';

import { DEFAULT_HOTKEYS_SCOPE_STACK_ITEM } from '@/hotkeys/constants';
import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';

export const hotkeysScopeStackState = atom<HotkeysScopeStackItem[]>({
  key: 'hotkeysScopeStackState',
  default: [DEFAULT_HOTKEYS_SCOPE_STACK_ITEM],
});
