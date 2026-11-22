import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuContainerChildrenInPositionOrder = <
  TItem extends Pick<NavigationMenuItem, 'parentId' | 'type' | 'position'>,
>({
  items,
  containerId,
}: {
  items: TItem[];
  containerId: string | null;
}): TItem[] =>
  items
    .filter(
      (item) =>
        (item.parentId ?? null) === containerId &&
        item.type !== NavigationMenuItemType.TAB,
    )
    .sort((a, b) => a.position - b.position);
