import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export const COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER = [
  'SELECTION',
  'CURRENT_VIEW',
  'THIS_OBJECT',
  'WORKSPACE',
  'GO_TO',
  'CREATE_RECORD',
  'DEVELOPER',
  'ASK_AI',
  'SEARCH',
] as const satisfies readonly CommandMenuItemSection[];
