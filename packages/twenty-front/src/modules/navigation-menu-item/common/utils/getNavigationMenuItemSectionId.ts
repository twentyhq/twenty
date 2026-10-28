import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';

export const getNavigationMenuItemSectionId = (
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'folderId'>[],
  containerId: string | null,
): string | null => {
  const container = items.find((item) => item.id === containerId);

  if (!isDefined(container) || isNavigationMenuItemTabOrSection(container)) {
    return containerId;
  }

  return getNavigationMenuItemSectionId(items, container.folderId ?? null);
};
