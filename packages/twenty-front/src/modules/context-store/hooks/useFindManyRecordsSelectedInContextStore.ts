import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

export const useFindManyRecordsSelectedInContextStore = ({
  instanceId,
  limit = 3,
}: {
  instanceId?: string;
  limit?: number;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    instanceId,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataItemId ?? '',
  });

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
    instanceId,
  );

  const contextStoreFilters = useRecoilComponentValue(
    contextStoreFiltersComponentState,
    instanceId,
  );

  const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
    instanceId,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const allFieldMetadataItems = objectMetadataItems.flatMap(
    (objectMetadataItem) => objectMetadataItem.fields,
  );

  const isSoftDeleteFilterActive = contextStoreFilters.some((filter) => {
    const foundFieldMetadataItem = allFieldMetadataItems.find(
      (fieldMetadataItem) => fieldMetadataItem.id === filter.fieldMetadataId,
    );

    return (
      foundFieldMetadataItem?.name === 'deletedAt' &&
      filter.operand === RecordFilterOperand.IsNotEmpty
    );
  });

  const queryFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  );

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
