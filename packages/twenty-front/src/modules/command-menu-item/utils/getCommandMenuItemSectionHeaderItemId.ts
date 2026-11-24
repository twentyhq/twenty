import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export const getCommandMenuItemSectionHeaderItemId = (
  section: CommandMenuItemSection,
) => `command-menu-section-header-${section}`;
