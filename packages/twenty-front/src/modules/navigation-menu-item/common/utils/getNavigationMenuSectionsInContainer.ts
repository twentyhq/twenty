import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionsInContainer = ({
  navigationMenuItems,
  containerId,
}: {
  navigationMenuItems: NavigationMenuItem[];
  containerId: string | null;
}): NavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (item) =>
        isNavigationMenuItemSection(item) &&
        (item.parentId ?? null) === containerId,
    )
    .sort((a, b) => a.position - b.position);
