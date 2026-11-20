import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemTabOrSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTabOrSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemPlacementScopeId = ({
  parentId,
  items,
}: {
  parentId: string | null | undefined;
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>[];
}): string | null => {
  let ancestor = items.find((candidate) => candidate.id === parentId);

  while (isDefined(ancestor)) {
    if (isNavigationMenuItemTabOrSection(ancestor)) {
      return ancestor.id;
    }

    const ancestorParentId = ancestor.parentId;

    ancestor = items.find((candidate) => candidate.id === ancestorParentId);
  }

  return null;
};
