import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemSectionAboveContainerItems } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSectionAboveContainerItems';

export const getNavigationMenuTabContainerIdsInDisplayOrder = ({
  sections,
  tabId,
}: {
  sections: NavigationMenuItem[];
  tabId: string | null;
}): (string | null)[] => [
  ...sections
    .filter(isNavigationMenuItemSectionAboveContainerItems)
    .map((section) => section.id),
  tabId,
  ...sections
    .filter(
      (section) => !isNavigationMenuItemSectionAboveContainerItems(section),
    )
    .map((section) => section.id),
];
