import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export type CommandMenuCollapsibleSectionNavigation = {
  section: CommandMenuItemSection;
  headerItemId: string;
  isOpen: boolean;
  itemIds: string[];
};
