import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export const COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER = [
  'SELECTION',
  'THIS_VIEW',
  'ASK_AND_FIND',
  'CREATE_RECORD',
  'WORKSPACE',
  'GO_TO',
] as const satisfies readonly CommandMenuItemSection[];
