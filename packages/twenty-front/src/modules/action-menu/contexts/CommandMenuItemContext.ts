import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { createContext } from 'react';

export type CommandMenuItemContextType = {
  isInSidePanel: boolean;
  displayType: 'button' | 'listItem' | 'dropdownItem';
  actionMenuType:
    | 'command-menu'
    | 'show-page-action-menu'
    | 'index-page-action-menu'
    | 'index-page-action-menu-dropdown'
    | 'command-menu-show-page-action-menu-dropdown';
  actions: CommandMenuItemConfig[];
};

export const CommandMenuItemContext = createContext<CommandMenuItemContextType>({
  isInSidePanel: false,
  actionMenuType: 'command-menu',
  displayType: 'button',
  actions: [],
});
