import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemAnySection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAnySection';

export const getNavigationMenuItemSectionsInContainer = ({
  items,
  containerId,
}: {
  items: NavigationMenuItem[];
  containerId: string | null;
}): NavigationMenuItem[] =>
  items
    .filter(
      (item) =>
        isNavigationMenuItemAnySection(item) &&
        (item.folderId ?? null) === containerId,
    )
    .sort((a, b) => a.position - b.position);
