import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const useSearchFilter = (filterDropdownId: string) => {
  const { objectNamePlural = '' } = useParams();
  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const searchVectorField = objectMetadataItem.fields.find(
    (field) => field.type === 'TS_VECTOR' && field.name === 'searchVector',
  );

  const [, setShowSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    filterDropdownId,
  );

  const [searchInputValue, setSearchInputValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    filterDropdownId,
  );

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
    if (!searchVectorField) return;

    const existingSearchFilter = getExistingSearchFilter();

    const searchRecordFilter = {
      id: existingSearchFilter?.id ?? crypto.randomUUID(),
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

  const setSearchInputValueFromExistingFilter = () => {
    const existingSearchFilter = getExistingSearchFilter();
    if (isDefined(existingSearchFilter)) {
      setSearchInputValue(existingSearchFilter.value);
    }
  };

  return {
    searchInputValue,
    setSearchInputValue,
    setShowSearchInput,
    applySearchFilter,
    removeEmptySearchFilter,
    setSearchInputValueFromExistingFilter,
  };
};
