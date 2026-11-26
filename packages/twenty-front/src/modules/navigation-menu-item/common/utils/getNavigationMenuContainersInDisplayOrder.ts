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
      (item) =>
        (item.parentId ?? null) === containerId &&
        item.type === type &&
        (type === NavigationMenuItemType.TAB ||
          isNonEmptyString(item.name) ||
          isNavigationMenuItemBuiltInSection(item)),
    )
    .map((item) => ({ ...item, name: item.name ?? '' }))
    .sort((a, b) => a.position - b.position);
