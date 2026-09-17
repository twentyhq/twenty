import { type CommandMenuContextApi } from 'twenty-shared/types';

import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';

// isInSidePanel answers "is the page this command acts on rendered inside the
// side panel", which is what keeps record navigation out of a panel-hosted
// record page. The command menu list is the side panel's own chrome rather
// than a page hosted in it, so a command that hides itself from a hosted page
// still belongs in the menu.
export const getCommandMenuContextApiForContainer = ({
  commandMenuContextApi,
  containerType,
}: {
  commandMenuContextApi: CommandMenuContextApi;
  containerType: CommandMenuItemContainerType;
}): CommandMenuContextApi =>
  containerType === CommandMenuItemContainerType.CommandMenuList
    ? { ...commandMenuContextApi, isInSidePanel: false }
    : commandMenuContextApi;
