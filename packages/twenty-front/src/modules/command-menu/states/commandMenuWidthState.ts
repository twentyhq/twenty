import { COMMAND_MENU_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/CommandMenuConstraints';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const COMMAND_MENU_WIDTH_VAR = '--command-menu-width';

export const commandMenuWidthState = createAtomState<number>({
  key: 'commandMenuWidth',
  defaultValue: COMMAND_MENU_CONSTRAINTS.default,
  useLocalStorage: true,
});
