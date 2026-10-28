import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAgentsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAgentsSection';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';

export const hasNavigationMenuTabOnlyAiSections = ({
  items,
  tabId,
}: {
  items: NavigationMenuItem[];
  tabId: string;
}) => {
  const children = items.filter((item) => item.folderId === tabId);

  return (
    children.length > 0 &&
    children.every(
      (child) =>
        isNavigationMenuItemAiChatSection(child) ||
        isNavigationMenuItemAgentsSection(child),
    )
  );
};
