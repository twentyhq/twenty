import { Action } from '@/action-menu/actions/components/Action';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { computeProgressText } from '@/action-menu/utils/computeProgressText';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const DeleteMultipleRecordsAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useRecoilComponentValue(
    contextStoreFiltersComponentState,
  );

  const contextStoreFilterGroups = useRecoilComponentValue(
    contextStoreFilterGroupsComponentState,
  );

  const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const { filterValueDependencies } = useFilterValueDependencies();

  const graphqlFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const { incrementalDeleteManyRecords, progress } =
    useIncrementalDeleteManyRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: graphqlFilter,
      pageSize: DEFAULT_QUERY_PAGE_SIZE,
      delayInMsBetweenMutations: 50,
    });

  const actionConfig = useContext(ActionConfigContext);

  if (!isDefined(actionConfig)) {
    return null;
  }

  const originalLabel = getActionLabel(actionConfig.label);

  const originalShortLabel = getActionLabel(actionConfig.shortLabel ?? '');

  const progressText = computeProgressText(progress);

  const actionConfigWithProgress = {
    ...actionConfig,
    label: `${originalLabel}${progressText}`,
    shortLabel: `${originalShortLabel}${progressText}`,
  };

  const handleDeleteClick = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();
    await incrementalDeleteManyRecords();
  };

  return (
    <ActionConfigContext.Provider value={actionConfigWithProgress}>
      <Action onClick={handleDeleteClick} />
    </ActionConfigContext.Provider>
  );
};
