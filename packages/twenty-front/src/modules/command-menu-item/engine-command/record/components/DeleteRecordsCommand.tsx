import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useAICElement } from '@aicorg/sdk-react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const DeleteRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem, selectedRecords, graphqlFilter } =
    useHeadlessCommandContextApi();

  if (!isDefined(recordIndexId) || !isDefined(objectMetadataItem)) {
    throw new Error(
      'Record index ID and object metadata are required to delete records',
    );
  }

  const recordId = selectedRecords[0]?.id;

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

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

  const isSingleRecord = selectedRecords.length === 1;
  const selectedRecord = selectedRecords.at(0);
  const objectLabel = isSingleRecord
    ? objectMetadataItem.labelSingular
    : objectMetadataItem.labelPlural;

  const { attributes } = useAICElement({
    agentAction: 'click',
    agentDescription:
      'Soft delete the selected record. This is reversible through the restore action.',
    agentEntityId: selectedRecord?.id ?? 'selection',
    agentEntityLabel: selectedRecord?.name ?? objectLabel,
    agentEntityType: objectMetadataItem.nameSingular,
    agentExecution: {
      settled_when: [
        'Deleted record banner is visible or the record disappears from the current active list view.',
      ],
    },
    agentId: `${objectMetadataItem.nameSingular}.soft_delete.${selectedRecord?.id ?? 'selection'}`,
    agentLabel: `Delete ${objectLabel}`,
    agentRecovery: {
      partial_state_changed: true,
      recovery: 'Use the restore action to recover the deleted record.',
      retryable: false,
    },
    agentRisk: 'high',
    agentWorkflowStep: `${objectMetadataItem.nameSingular}.soft_delete`,
  });

  const handleExecute = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();

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

  return (
    <>
      <span hidden {...attributes} />
      <HeadlessEngineCommandWrapperEffect execute={handleExecute} />
    </>
  );
};
