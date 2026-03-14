import { CommandModal } from '@/command-menu-item/display/components/CommandModal';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { computeProgressText } from '@/command-menu-item/utils/computeProgressText';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useIncrementalDestroyManyRecords } from '@/object-record/hooks/useIncrementalDestroyManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const DestroyMultipleRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { removeSelectedRecordsFromRecordBoard } =
    useRemoveSelectedRecordsFromRecordBoard(recordIndexId);

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const deletedAtFilter: RecordGqlOperationFilter = {
    deletedAt: { is: 'NOT_NULL' },
  };
  const graphqlFilter = {
    ...computeContextStoreFilters({
      contextStoreTargetedRecordsRule,
      contextStoreFilters,
      contextStoreFilterGroups,
      objectMetadataItem,
      filterValueDependencies,
      contextStoreAnyFieldFilterValue,
    }),
    ...deletedAtFilter,
  };

  const { incrementalDestroyManyRecords, progress } =
    useIncrementalDestroyManyRecords({
      objectNameSingular: objectMetadataItem.nameSingular,
      filter: graphqlFilter,
      pageSize: DEFAULT_QUERY_PAGE_SIZE,
      delayInMsBetweenMutations: 50,
      recordIds:
        contextStoreTargetedRecordsRule.mode === 'selection'
          ? contextStoreTargetedRecordsRule.selectedRecordIds
          : undefined,
    });

  const actionConfig = useContext(CommandConfigContext);

  if (!isDefined(actionConfig)) {
    return null;
  }

  const originalLabel = getCommandMenuItemLabel(actionConfig.label);

  const originalShortLabel = getCommandMenuItemLabel(
    actionConfig.shortLabel ?? '',
  );

  const progressText = computeProgressText(progress);

  const actionConfigWithProgress = {
    ...actionConfig,
    label: `${originalLabel}${progressText}`,
    shortLabel: `${originalShortLabel}${progressText}`,
  };

  const handleDestroyClick = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();
    await incrementalDestroyManyRecords();
  };

  return (
    <CommandConfigContext.Provider value={actionConfigWithProgress}>
      <CommandModal
        title={t`Permanently Destroy Records`}
        subtitle={t`Are you sure you want to destroy these records? They won't be recoverable anymore.`}
        onConfirmClick={handleDestroyClick}
        confirmButtonText={t`Destroy Records`}
      />
    </CommandConfigContext.Provider>
  );
};
