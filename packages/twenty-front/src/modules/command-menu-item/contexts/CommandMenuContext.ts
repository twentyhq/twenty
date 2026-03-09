import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { createContext } from 'react';

export type CommandMenuItemContextType = {
  isInSidePanel: boolean;
  displayType: 'button' | 'listItem' | 'dropdownItem';
  containerType: CommandMenuItemContainerType;
  commandMenuItems: CommandMenuItemConfig[];
};

export const CommandMenuContext = createContext<CommandMenuItemContextType>(
  {
    isInSidePanel: false,
    containerType: 'command-menu-list',
    displayType: 'button',
    commandMenuItems: [],
  },
);
