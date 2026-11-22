import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemTabId = ({
  parentId,
  items,
}: {
  parentId: string | null | undefined;
  items: Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>[];
}): string | null => {
  let ancestor = items.find((candidate) => candidate.id === parentId);

  while (isDefined(ancestor)) {
    if (ancestor.type === NavigationMenuItemType.TAB) {
      return ancestor.id;
    }

    const ancestorParentId = ancestor.parentId;

    ancestor = items.find((candidate) => candidate.id === ancestorParentId);
  }

  return null;
};
