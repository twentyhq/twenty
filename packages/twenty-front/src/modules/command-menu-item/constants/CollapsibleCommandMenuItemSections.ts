import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export const COLLAPSIBLE_COMMAND_MENU_ITEM_SECTIONS = [
  'GO_TO',
  'CREATE_RECORD',
] as const satisfies readonly CommandMenuItemSection[];
