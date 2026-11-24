import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';

export type CommandMenuItemSectionsToggleState = {
  openSectionsWhileIdle: CommandMenuItemSection[];
  closedSectionsWhileSearching: {
    search: string;
    sections: CommandMenuItemSection[];
  };
};
