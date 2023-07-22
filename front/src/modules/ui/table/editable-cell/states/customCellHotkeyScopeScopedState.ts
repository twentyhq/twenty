import { atomFamily } from 'recoil';

import { HotkeyScope } from '../../../hotkey/types/HotkeyScope';

export const customCellHotkeyScopeScopedState = atomFamily<
  HotkeyScope | null,
  string
>({
  key: 'customCellHotkeyScopeScopedState',
  default: null,
});
