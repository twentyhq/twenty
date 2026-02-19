import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isDefined } from 'twenty-shared/utils';

export const DeleteSingleRecordAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const recordId = useSelectedRecordIdOrThrow();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { sortedFavorites: favorites } = useFavorites();
  const { deleteFavorite } = useDeleteFavorite();

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const handleDeleteClick = async () => {
    removeSelectedRecordsFromRecordBoard();

    resetTableRowSelection();

    const foundFavorite = favorites?.find(
      (favorite) => favorite.recordId === recordId,
    );

    if (isDefined(foundFavorite)) {
      deleteFavorite(foundFavorite.id);
    }

    const foundNavigationMenuItem = [
      ...navigationMenuItems,
      ...workspaceNavigationMenuItems,
    ].find((item) => item.targetRecordId === recordId);

    if (isDefined(foundNavigationMenuItem)) {
      removeNavigationMenuItemsByTargetRecordIds([recordId]);
    }

    await deleteOneRecord(recordId);
  };

  return <Action onClick={handleDeleteClick} />;
};
