import { COMMAND_MENU_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/CommandMenuConstraints';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const COMMAND_MENU_WIDTH_VAR = '--command-menu-width';

export const commandMenuWidthState = createState<number>({
  key: 'commandMenuWidth',
  defaultValue: COMMAND_MENU_CONSTRAINTS.default,
  useLocalStorage: true,
});
