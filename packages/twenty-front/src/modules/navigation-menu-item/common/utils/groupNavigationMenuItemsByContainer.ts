import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const groupNavigationMenuItemsByContainer = ({
  items,
  containerId,
}: {
  items: NavigationMenuItem[];
  containerId: string | null;
}) => {
  const isTopLevelItem = (item: NavigationMenuItem) =>
    (item.parentId ?? null) === containerId;

  const folderChildrenById = new Map<string, NavigationMenuItem[]>();

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
