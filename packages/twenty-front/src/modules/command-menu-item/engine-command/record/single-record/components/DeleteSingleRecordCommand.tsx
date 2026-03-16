import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
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
    useNavigationMenuItemsData();

  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const handleExecute = async () => {
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

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
