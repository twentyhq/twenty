import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { isDefined } from 'twenty-shared/utils';

export const DeleteRecordsCommand = () => {
  const {
    recordIndexId,
    objectMetadataItem,
    selectedRecords,
    graphqlFilter,
  } = useHeadlessCommandContextApi();

  if (!isDefined(recordIndexId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record index ID and object metadata are required to delete records',
    );
  }

  const isSingleRecord = selectedRecords.length === 1;
  const recordId = selectedRecords[0]?.id;

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { incrementalDeleteManyRecords } = useIncrementalDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter ?? {},
    pageSize: DEFAULT_QUERY_PAGE_SIZE,
    delayInMsBetweenMutations: 50,
  });

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

    if (isSingleRecord && isDefined(recordId)) {
      const foundNavigationMenuItem = [
        ...navigationMenuItems,
        ...workspaceNavigationMenuItems,
      ].find((item) => item.targetRecordId === recordId);

      if (isDefined(foundNavigationMenuItem)) {
        removeNavigationMenuItemsByTargetRecordIds([recordId]);
      }

      await deleteOneRecord(recordId);
    } else {
      await incrementalDeleteManyRecords();
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
