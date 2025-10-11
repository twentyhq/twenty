import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const DestroyMultipleRecordsAction = () => {
  const { recordIndexId, objectMetadataItem } =
    useRecordIndexIdFromCurrentContextStore();

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);

  const { destroyManyRecords } = useDestroyManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

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

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const handleDestroyClick = async () => {
    const recordsToDestroy = await fetchAllRecordIds();
    const recordIdsToDestroy = recordsToDestroy.map((record) => record.id);

    resetTableRowSelection();

    await destroyManyRecords({ recordIdsToDestroy });
  };

  return (
    <ActionModal
      title="Permanently Destroy Records"
      subtitle="Are you sure you want to destroy these records? They won't be recoverable anymore."
      onConfirmClick={handleDestroyClick}
      confirmButtonText="Destroy Records"
    />
  );
};
