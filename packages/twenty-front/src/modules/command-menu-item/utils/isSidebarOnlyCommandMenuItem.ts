import {
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const isSidebarOnlyCommandMenuItem = (
  item: Pick<CommandMenuItemFieldsFragment, 'engineComponentKey'>,
) => item.engineComponentKey === EngineComponentKey.OPEN_COMMAND_MENU;
