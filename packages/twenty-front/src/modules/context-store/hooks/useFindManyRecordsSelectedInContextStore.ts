import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { findFieldMetadataItemByIdSelector } from '@/object-metadata/states/findFieldMetadataItemByIdSelector';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFindManyRecordsSelectedInContextStore = ({
  instanceId,
  limit = 3,
}: {
  instanceId?: string;
  limit?: number;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    instanceId,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId ?? '',
  });

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
    instanceId,
  );

  const contextStoreFilters = useAtomComponentStateValue(
    contextStoreFiltersComponentState,
    instanceId,
  );

  const contextStoreFilterGroups = useAtomComponentStateValue(
    contextStoreFilterGroupsComponentState,
    instanceId,
  );

  const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
    contextStoreAnyFieldFilterValueComponentState,
    instanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const findFieldMetadataItemById = useAtomStateValue(
    findFieldMetadataItemByIdSelector,
  );

  const isSoftDeleteFilterActive = contextStoreFilters.some(
    (filter) =>
      findFieldMetadataItemById(filter.fieldMetadataId)?.name === 'deletedAt' &&
      filter.operand === RecordFilterOperand.IS_NOT_EMPTY,
  );

  const queryFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    findFieldMetadataItemById,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const { records, loading, totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    filter: queryFilter,
    withSoftDeleted: isSoftDeleteFilterActive,
    orderBy: [
      {
        position: 'AscNullsFirst',
      },
    ],
    skip:
      contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0,
    limit,
  });

  return {
    records,
    totalCount,
    loading,
  };
};
