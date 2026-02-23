import { COMMAND_MENU_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/CommandMenuConstraints';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const COMMAND_MENU_WIDTH_VAR = '--command-menu-width';

export const commandMenuWidthState = createStateV2<number>({
  key: 'commandMenuWidth',
  defaultValue: COMMAND_MENU_CONSTRAINTS.default,
  useLocalStorage: true,
});
