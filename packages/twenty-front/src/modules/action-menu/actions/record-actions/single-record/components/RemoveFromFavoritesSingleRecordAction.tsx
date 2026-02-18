import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { isDefined } from 'twenty-shared/utils';

export const RemoveFromFavoritesSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { sortedFavorites: favorites } = useFavorites();
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();

  const { deleteFavorite } = useDeleteFavorite();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const foundFavorite = favorites?.find(
    (favorite) => favorite.recordId === recordId,
  );

  const foundNavigationMenuItem = [
    ...navigationMenuItems,
    ...workspaceNavigationMenuItems,
  ].find(
    (item) =>
      item.targetRecordId === recordId &&
      item.targetObjectMetadataId === objectMetadataItem.id,
  );

  const handleClick = () => {
    if (!isDefined(foundNavigationMenuItem) || !isDefined(foundFavorite)) {
      return;
    }

    deleteNavigationMenuItem(foundNavigationMenuItem.id);
    deleteFavorite(foundFavorite.id);
  };

  return <Action onClick={handleClick} />;
};
