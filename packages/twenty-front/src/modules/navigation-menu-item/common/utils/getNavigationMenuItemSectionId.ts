import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemContainer } from '@/navigation-menu-item/common/utils/isNavigationMenuItemContainer';

export const getNavigationMenuItemSectionId = ({
  items,
  containerId,
}: {
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'folderId'>[];
  containerId: string | null;
}): string | null => {
  const container = items.find((item) => item.id === containerId);

  if (!isDefined(container) || isNavigationMenuItemContainer(container)) {
    return containerId;
  }

  return getNavigationMenuItemSectionId({
    items,
    containerId: container.folderId ?? null,
  });
};
