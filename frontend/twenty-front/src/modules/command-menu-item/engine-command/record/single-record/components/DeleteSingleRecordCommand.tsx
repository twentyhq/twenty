import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isDefined } from 'twenty-shared/utils';

export const DeleteSingleRecordCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;

  if (
    !isDefined(recordId) ||
    !isDefined(recordIndexId) ||
    !isDefined(objectMetadataItem)
  ) {
    throw new Error(
      'Record ID, record index ID, and object metadata are required to delete single record',
    );
  }

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
