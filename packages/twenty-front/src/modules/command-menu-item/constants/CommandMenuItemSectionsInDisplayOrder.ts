import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

// Narrowest context first: what you picked, then what you are looking at, then
// the ways out of here. Pinned and Fallback are not listed because they are not
// sections: pinning is orthogonal, and Fallback only renders when nothing
// matched.
export const COMMAND_MENU_ITEM_SECTIONS_IN_DISPLAY_ORDER = [
  'SELECTION',
  'THIS_VIEW',
  'ASK_AND_FIND',
  'CREATE_RECORD',
  'WORKSPACE',
  'GO_TO',
] as const satisfies readonly CommandMenuItemSection[];
