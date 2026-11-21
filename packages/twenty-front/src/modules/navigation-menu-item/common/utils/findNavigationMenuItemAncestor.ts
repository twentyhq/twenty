import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const findNavigationMenuItemAncestor = <
  TItem extends Pick<NavigationMenuItem, 'id' | 'parentId'>,
>({
  parentId,
  items,
  isMatch,
}: {
  parentId: string | null | undefined;
  items: TItem[];
  isMatch: (ancestor: TItem) => boolean;
}): TItem | undefined => {
  let ancestor = items.find((candidate) => candidate.id === parentId);

  while (isDefined(ancestor) && !isMatch(ancestor)) {
    const ancestorParentId = ancestor.parentId;

    ancestor = items.find((candidate) => candidate.id === ancestorParentId);
  }

  return ancestor;
};
