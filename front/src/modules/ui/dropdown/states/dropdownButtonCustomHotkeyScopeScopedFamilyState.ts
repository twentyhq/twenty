import { atomFamily } from 'recoil';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const dropdownButtonCustomHotkeyScopeScopedFamilyState = atomFamily<
  HotkeyScope | null | undefined,
  string
>({
  key: 'dropdownButtonCustomHotkeyScopeScopedState',
  default: null,
});
