import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';

export const isNavigationMenuItemTabOrSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) => isNavigationMenuItemTab(item) || isNavigationMenuItemAnySection(item);
