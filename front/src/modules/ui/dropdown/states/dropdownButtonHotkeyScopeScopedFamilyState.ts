import { atomFamily } from 'recoil';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

export const dropdownButtonHotkeyScopeScopedFamilyState = atomFamily<
  HotkeyScope | null | undefined,
  string
>({
  key: 'dropdownButtonHotkeyScopeScopedFamilyState',
  default: null,
});
