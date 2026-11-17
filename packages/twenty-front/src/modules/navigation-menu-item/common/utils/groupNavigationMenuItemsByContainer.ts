import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const groupNavigationMenuItemsByContainer = <
  TItem extends Pick<NavigationMenuItem, 'parentId'>,
>({
  items,
  containerId,
}: {
  items: TItem[];
  containerId: string | null;
}) => {
  const isTopLevelItem = (item: TItem) =>
    (item.parentId ?? null) === containerId;

  const folderChildrenById = new Map<string, TItem[]>();

  for (const item of items) {
    if (isDefined(item.parentId) && !isTopLevelItem(item)) {
      folderChildrenById.set(item.parentId, [
        ...(folderChildrenById.get(item.parentId) ?? []),
        item,
      ]);
    }
  }

  return {
    topLevelItems: items.filter(isTopLevelItem),
    folderChildrenById,
  };
};
