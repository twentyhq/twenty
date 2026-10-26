import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAgentsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAgentsSection';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemCommandsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemCommandsSection';
import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';

export const isNavigationMenuItemAnySection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  isNavigationMenuItemSection(item) ||
  isNavigationMenuItemAiChatSection(item) ||
  isNavigationMenuItemAgentsSection(item) ||
  isNavigationMenuItemCommandsSection(item);
