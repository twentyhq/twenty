import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export const COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER = [
  'SELECTION',
  'CURRENT_VIEW',
  'THIS_OBJECT',
  'ASK_AND_FIND',
  'CREATE_RECORD',
  'WORKSPACE',
  'GO_TO',
  'DEVELOPER',
] as const satisfies readonly CommandMenuItemSection[];
