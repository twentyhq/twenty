import { ActionModal } from '@/action-menu/actions/components/ActionModal';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { DEFAULT_QUERY_PAGE_SIZE } from '@/object-record/constants/DefaultQueryPageSize';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';

export const DeleteMultipleRecordsAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: getRecordIndexIdFromObjectNamePluralAndViewId(
      objectMetadataItem.namePlural,
      contextStoreCurrentViewId,
    ),
  });

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useRecoilComponentValue(
    contextStoreFiltersComponentState,
  );

  const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const graphqlFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  );

  const { fetchAllRecords: fetchAllRecordIds } = useLazyFetchAllRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: graphqlFilter,
    limit: DEFAULT_QUERY_PAGE_SIZE,
    recordGqlFields: { id: true },
  });

  const handleDeleteClick = async () => {
    const recordsToDelete = await fetchAllRecordIds();
    const recordIdsToDelete = recordsToDelete.map((record) => record.id);

    resetTableRowSelection();

    await deleteManyRecords({
      recordIdsToDelete,
    });
  };

  return (
    <ActionModal
      title="Delete Records"
      subtitle={t`Are you sure you want to delete these records? They can be recovered from the Command menu.`}
      onConfirmClick={handleDeleteClick}
      confirmButtonText="Delete Records"
    />
  );
};
