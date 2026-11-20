import { getNavigationMenuItemPlacementScopeId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPlacementScopeId';
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
  const scopeId = getNavigationMenuItemPlacementScopeId({ parentId, items });

  return items.filter(
    (item) =>
      getNavigationMenuItemPlacementScopeId({
        parentId: item.parentId,
        items,
      }) === scopeId,
  );
};
