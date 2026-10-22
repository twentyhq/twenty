import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';

export const isNavigationMenuItemTabOrSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) => isNavigationMenuItemTab(item) || isNavigationMenuItemSection(item);
