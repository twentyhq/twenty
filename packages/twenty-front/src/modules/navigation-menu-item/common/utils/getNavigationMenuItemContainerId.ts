import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemContainerId = ({
  item,
  items,
}: {
  item: Pick<NavigationMenuItem, 'parentId'>;
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>[];
}): string | null => {
  const parent = items.find((candidate) => candidate.id === item.parentId);

  if (isDefined(parent) && isNavigationMenuItemFolder(parent)) {
    return parent.parentId ?? null;
  }

  return item.parentId ?? null;
};
