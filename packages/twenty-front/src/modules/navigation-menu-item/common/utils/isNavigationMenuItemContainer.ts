import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemContainer = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  item.type === NavigationMenuItemType.FOLDER ||
  item.type === NavigationMenuItemType.TAB ||
  item.type === NavigationMenuItemType.SECTION;
