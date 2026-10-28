import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAgentsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAgentsSection';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemFavoritesSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFavoritesSection';
import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';

export const isNavigationMenuItemAnySection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  isNavigationMenuItemSection(item) ||
  isNavigationMenuItemAiChatSection(item) ||
  isNavigationMenuItemAgentsSection(item) ||
  isNavigationMenuItemFavoritesSection(item);
