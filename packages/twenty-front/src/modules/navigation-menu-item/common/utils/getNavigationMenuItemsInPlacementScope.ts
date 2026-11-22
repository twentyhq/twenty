import { getNavigationMenuItemContainerId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerId';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemsInPlacementScope = <
  TItem extends Pick<NavigationMenuItem, 'id' | 'type' | 'parentId'>,
>({
  parentId,
  items,
}: {
  parentId: string | null | undefined;
  items: TItem[];
}): TItem[] => {
  const scopeId = getNavigationMenuItemContainerId({
    item: { parentId },
    items,
  });

  return items.filter(
    (item) => getNavigationMenuItemContainerId({ item, items }) === scopeId,
  );
};
