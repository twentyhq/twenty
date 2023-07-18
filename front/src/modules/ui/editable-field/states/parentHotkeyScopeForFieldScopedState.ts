import { atomFamily } from 'recoil';

import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';

export const parentHotkeyScopeForFieldScopedState = atomFamily<
  HotkeyScope | null,
  string
>({
  key: 'parentHotkeyScopeForFieldScopedState',
  default: null,
});
