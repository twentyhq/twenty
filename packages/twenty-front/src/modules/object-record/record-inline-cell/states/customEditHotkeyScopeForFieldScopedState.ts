import { atomFamily } from 'recoil';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const customEditHotkeyScopeForFieldScopedState = atomFamily<
  HotkeyScope | null,
  string
>({
  key: 'customEditHotkeyScopeForFieldScopedState',
  default: null,
});
