import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) => item.type === NavigationMenuItemType.SECTION;
