import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { PLACEHOLDER_RECORD_INDEX_ID } from '@/object-record/record-index/constants/PlaceholderRecordIndexId';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const DeleteRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (!isDefined(objectMetadataItem)) {
    throw new Error('Object metadata is required to delete records');
  }

  const recordId = selectedRecords[0]?.id;

  const { resetTableRowSelection } = useResetTableRowSelection(
    recordIndexId ?? PLACEHOLDER_RECORD_INDEX_ID,
  );

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(
      recordIndexId ?? PLACEHOLDER_RECORD_INDEX_ID,
    );

  const noMatchFilter: RecordGqlOperationFilter = { id: { in: [] } };

  const { incrementalDeleteManyRecords } = useIncrementalDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter ?? noMatchFilter,
    pageSize: DEFAULT_QUERY_PAGE_SIZE,
    delayInMsBetweenMutations: 50,
  });

  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();

  const { removeNavigationMenuItemsByTargetRecordIds } =
    useRemoveNavigationMenuItemByTargetRecordId();

  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleExecute = async () => {
    if (isDefined(recordIndexId)) {
      removeSelectedRecordsFromRecordBoard();
      resetTableRowSelection();
    }
    closeSidePanelMenu();

    if (isDefined(recordId)) {
      const foundNavigationMenuItem = [
        ...navigationMenuItems,
        ...workspaceNavigationMenuItems,
      ].find((item) => item.targetRecordId === recordId);

      if (isDefined(foundNavigationMenuItem)) {
        removeNavigationMenuItemsByTargetRecordIds([recordId]);
      }
    }

    if (!isDefined(graphqlFilter)) {
      throw new Error('Cannot delete records without a valid filter');
    }

    await incrementalDeleteManyRecords();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
