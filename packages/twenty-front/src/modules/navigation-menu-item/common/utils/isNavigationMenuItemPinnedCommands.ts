import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemPinnedCommands = (
  item: Pick<NavigationMenuItem, 'type'>,
) => item.type === NavigationMenuItemType.PINNED_COMMANDS;
