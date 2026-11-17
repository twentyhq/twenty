import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemContainer = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  item.type === NavigationMenuItemType.FOLDER ||
  isNavigationMenuItemTabOrSection(item);
