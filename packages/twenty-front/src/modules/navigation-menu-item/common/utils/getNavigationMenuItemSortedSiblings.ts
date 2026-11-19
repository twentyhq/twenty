import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemSortedSiblings = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'id' | 'parentId' | 'position'
  >,
>({
  items,
  navigationMenuItemId,
  visibleItemIds,
  rootContainerId,
}: {
  items: TNavigationMenuItem[];
  navigationMenuItemId: string;
  visibleItemIds: Set<string>;
  rootContainerId: string | null;
}): TNavigationMenuItem[] | null => {
  const currentItem = items.find((item) => item.id === navigationMenuItemId);

  if (!isDefined(currentItem)) {
    return null;
  }

  const getContainerId = (item: TNavigationMenuItem) =>
    item.parentId ?? rootContainerId;
  const containerId = getContainerId(currentItem);

  return items
    .filter(
      (item) =>
        getContainerId(item) === containerId && visibleItemIds.has(item.id),
    )
    .sort((a, b) => a.position - b.position);
};
