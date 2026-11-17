import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuContainersInDisplayOrder = ({
  navigationMenuItems,
  type,
  containerId,
}: {
  navigationMenuItems: NavigationMenuItem[];
  type: NavigationMenuItemType.TAB | NavigationMenuItemType.SECTION;
  containerId: string | null;
}): NamedNavigationMenuItem[] =>
  navigationMenuItems
    .filter(
      (item): item is NamedNavigationMenuItem =>
        (item.type === type ||
          (type === NavigationMenuItemType.SECTION &&
            isNavigationMenuItemBuiltInSection(item))) &&
        isNonEmptyString(item.name) &&
        (item.parentId ?? null) === containerId,
    )
    .sort((a, b) => a.position - b.position);
