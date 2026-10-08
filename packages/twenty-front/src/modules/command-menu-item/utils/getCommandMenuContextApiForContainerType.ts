import { type CommandMenuContextApi } from 'twenty-shared/types';

import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';

const isPageHostedInSidePanel = ({
  commandMenuContextApi,
  containerType,
}: {
  commandMenuContextApi: CommandMenuContextApi;
  containerType: CommandMenuItemContainerType;
}): boolean =>
  commandMenuContextApi.isInSidePanel &&
  containerType !== CommandMenuItemContainerType.CommandMenuList;

export const getCommandMenuContextApiForContainerType = ({
  commandMenuContextApi,
  containerType,
}: {
  commandMenuContextApi: CommandMenuContextApi;
  containerType: CommandMenuItemContainerType;
}): CommandMenuContextApi => ({
  ...commandMenuContextApi,
  isInSidePanel: isPageHostedInSidePanel({
    commandMenuContextApi,
    containerType,
  }),
});
