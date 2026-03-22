import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemObject = (
  item: Pick<NavigationMenuItem, 'type'>,
) => item.type === NavigationMenuItemType.OBJECT;
