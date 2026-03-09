import { Command } from '@/command-menu-item/display/components/Command';
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
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useRemoveSelectedRecordsFromRecordBoard } from '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const DeleteMultipleRecordsCommand = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

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

  const handleDeleteClick = async () => {
    removeSelectedRecordsFromRecordBoard();
    resetTableRowSelection();
    await incrementalDeleteManyRecords();
  };

  return (
    <CommandConfigContext.Provider value={actionConfigWithProgress}>
      <Command onClick={handleDeleteClick} />
    </CommandConfigContext.Provider>
  );
};
