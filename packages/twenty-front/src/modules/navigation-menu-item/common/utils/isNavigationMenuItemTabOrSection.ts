import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemTabOrSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  item.type === NavigationMenuItemType.TAB ||
  item.type === NavigationMenuItemType.SECTION ||
  isNavigationMenuItemBuiltInSection(item);
