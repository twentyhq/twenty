import { atom } from 'recoil';

import { COMMAND_MENU_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/CommandMenuConstraints';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

export const COMMAND_MENU_WIDTH_VAR = '--command-menu-width';

export const commandMenuWidthState = atom<number>({
  key: 'commandMenuWidth',
  default: COMMAND_MENU_CONSTRAINTS.default,
  effects: [localStorageEffect()],
});
