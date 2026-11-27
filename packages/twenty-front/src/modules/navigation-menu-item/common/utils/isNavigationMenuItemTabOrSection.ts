import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemTabOrSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  item.type === NavigationMenuItemType.TAB ||
  item.type === NavigationMenuItemType.SECTION;
