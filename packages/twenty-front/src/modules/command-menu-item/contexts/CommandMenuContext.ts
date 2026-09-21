import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { createContext } from 'react';
import { type CommandMenuContextApi } from 'twenty-shared/types';

export type CommandMenuContextType = {
  displayType: 'button' | 'listItem' | 'dropdownItem';
  containerType: CommandMenuItemContainerType;
  commandMenuItems: CommandMenuItemDefinition[];
  commandMenuContextApi: CommandMenuContextApi;
  isInPreviewMode: boolean;
};

export const CommandMenuContext = createContext<CommandMenuContextType>({
  containerType: CommandMenuItemContainerType.CommandMenuList,
  displayType: 'button',
  commandMenuItems: [],
  commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
  isInPreviewMode: false,
});
