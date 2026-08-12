import { createContext } from 'react';

// Only one command menu item opens a submenu today, but the shape mirrors
// ObjectOptionsDropdown so more can be added without reworking the plumbing.
export type CommandMenuDropdownContentId = 'related-people';

export type CommandMenuDropdownSubMenuContextValue = {
  onContentChange: (contentId: CommandMenuDropdownContentId) => void;
};

export const CommandMenuDropdownSubMenuContext =
  createContext<CommandMenuDropdownSubMenuContextValue | null>(null);
