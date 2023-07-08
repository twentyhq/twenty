import { atom } from 'recoil';

import { InternalHotkeysScope } from '../../types/internal/InternalHotkeysScope';

export type CustomHotkeysScopes = {
  [InternalHotkeysScope.Goto]: boolean;
  [InternalHotkeysScope.CommandMenu]: boolean;
};

export const customHotkeysScopesState = atom<CustomHotkeysScopes>({
  key: 'customHotkeysScopesState',
  default: {
    'command-menu': true,
    goto: false,
  },
});
