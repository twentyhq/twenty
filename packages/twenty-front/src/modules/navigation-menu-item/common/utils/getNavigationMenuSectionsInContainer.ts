import { isNonEmptyString } from '@sniptt/guards';

import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { isNavigationMenuItemSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuSectionsInContainer = ({
  navigationMenuItems,
  containerId,
}: {
  navigationMenuItems: NavigationMenuItem[];
  containerId: string | null;
}): NamedNavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (item): item is NamedNavigationMenuItem =>
        isNavigationMenuItemSection(item) &&
        isNonEmptyString(item.name) &&
        (item.parentId ?? null) === containerId,
    )
    .sort((a, b) => a.position - b.position);
