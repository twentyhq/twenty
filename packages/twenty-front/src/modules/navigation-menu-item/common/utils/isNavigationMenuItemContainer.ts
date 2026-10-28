import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';
import { isNavigationMenuItemPinnedCommands } from '@/navigation-menu-item/common/utils/isNavigationMenuItemPinnedCommands';
import { isNavigationMenuItemTab } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTab';

export const isNavigationMenuItemContainer = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  isNavigationMenuItemTab(item) ||
  isNavigationMenuItemAnySection(item) ||
  isNavigationMenuItemPinnedCommands(item);
