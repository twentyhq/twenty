import { NAVIGATION_MENU_ITEM_COMMAND_KEYS } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemCommandKey = (
  item: Pick<NavigationMenuItem, 'commandKey'>,
) =>
  NAVIGATION_MENU_ITEM_COMMAND_KEYS.find(
    (commandKey) => commandKey === item.commandKey,
  );
