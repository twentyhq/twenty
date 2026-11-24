import { COLLAPSIBLE_COMMAND_MENU_ITEM_SECTIONS } from '@/command-menu-item/constants/CollapsibleCommandMenuItemSections';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

const collapsibleSections: readonly CommandMenuItemSection[] =
  COLLAPSIBLE_COMMAND_MENU_ITEM_SECTIONS;

export const isCollapsibleCommandMenuItemSection = (
  section: CommandMenuItemSection,
): boolean => collapsibleSections.includes(section);
