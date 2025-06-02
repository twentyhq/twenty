import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useSearchVectorField } from './useSearchVectorField';

export const useSearchFilterOperations = () => {
  const { searchVectorField } = useSearchVectorField();
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();

  const getExistingSearchFilter = () => {
    return currentRecordFilters.find(
      (filter) => filter.operand === ViewFilterOperand.Search,
    );
  };

  const applySearchFilter = (value: string) => {
    if (!searchVectorField) {
      return;
    }

    const existingSearchFilter = getExistingSearchFilter();

    const searchRecordFilter = {
      id: existingSearchFilter?.id ?? v4(),
      fieldMetadataId: searchVectorField.id,
      value: value,
      displayValue: value,
      operand: ViewFilterOperand.Search,
      type: getFilterTypeFromFieldType(searchVectorField.type),
      label: 'Search',
    };

    upsertRecordFilter(searchRecordFilter);
  };

  const removeEmptySearchFilter = () => {
    const searchFilter = getExistingSearchFilter();

    if (
      isDefined(searchFilter) &&
      isRecordFilterConsideredEmpty(searchFilter)
    ) {
      removeRecordFilter({
        recordFilterId: searchFilter.id,
      });
    }
  };

  return {
    applySearchFilter,
    removeEmptySearchFilter,
    getExistingSearchFilter,
  };
};
