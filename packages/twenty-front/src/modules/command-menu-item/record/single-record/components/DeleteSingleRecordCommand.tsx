import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isDefined } from 'twenty-shared/utils';

export const DeleteSingleRecordCommand = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const recordId = useSelectedRecordIdOrThrow();

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const handleDeleteClick = async () => {
    removeSelectedRecordsFromRecordBoard();

    resetTableRowSelection();

    const foundNavigationMenuItem = [
      ...navigationMenuItems,
      ...workspaceNavigationMenuItems,
    ].find((item) => item.targetRecordId === recordId);

    if (isDefined(foundNavigationMenuItem)) {
      removeNavigationMenuItemsByTargetRecordIds([recordId]);
    }

    await deleteOneRecord(recordId);
  };

  return <Command onClick={handleDeleteClick} />;
};
