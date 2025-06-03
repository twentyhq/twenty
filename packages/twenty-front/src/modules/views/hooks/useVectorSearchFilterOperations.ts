import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useVectorSearchField } from './useVectorSearchField';

export const useVectorSearchFilterOperations = () => {
  const { vectorSearchField } = useVectorSearchField();
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const getExistingVectorSearchFilter = () => {
    return currentRecordFilters.find(
      (filter) => filter.operand === ViewFilterOperand.VectorSearch,
    );
  };

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
    getExistingVectorSearchFilter,
  };
};
