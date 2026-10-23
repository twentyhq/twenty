import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';

export const isNavigationMenuItemAnySection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  isNavigationMenuItemSection(item) || isNavigationMenuItemAiChatSection(item);
