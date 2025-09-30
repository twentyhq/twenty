import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useVectorSearchFieldInRecordIndexContextOrThrow } from '@/views/hooks/useVectorSearchFieldInRecordIndexContextOrThrow';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useVectorSearchFilterState } from './useVectorSearchFilterState';

export const useVectorSearchFilterActions = () => {
  const { vectorSearchField } =
    useVectorSearchFieldInRecordIndexContextOrThrow();
  const { getExistingVectorSearchFilter } = useVectorSearchFilterState();
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const applyVectorSearchFilter = (value: string) => {
    if (!vectorSearchField) {
      return;
    }

    const existingVectorSearchFilter = getExistingVectorSearchFilter();

    const vectorSearchRecordFilter = {
      id: existingVectorSearchFilter?.id ?? v4(),
      fieldMetadataId: vectorSearchField.id,
      value: value,
      displayValue: value,
      operand: ViewFilterOperand.VectorSearch,
      type: getFilterTypeFromFieldType(vectorSearchField.type),
      label: 'Search',
    };

    upsertRecordFilter(vectorSearchRecordFilter);
  };

  const removeEmptyVectorSearchFilter = () => {
    const vectorSearchFilter = getExistingVectorSearchFilter();

    if (
      isDefined(vectorSearchFilter) &&
      isRecordFilterConsideredEmpty(vectorSearchFilter)
    ) {
      removeRecordFilter({
        recordFilterId: vectorSearchFilter.id,
      });
    }
  };

  return {
    applyVectorSearchFilter,
    removeEmptyVectorSearchFilter,
  };
};
