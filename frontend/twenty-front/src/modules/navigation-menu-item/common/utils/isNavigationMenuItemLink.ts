import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemLink = (
  item: Pick<NavigationMenuItem, 'type'>,
) => item.type === NavigationMenuItemType.LINK;
