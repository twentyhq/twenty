import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { MultipleRecordSelectDropdown } from '@/object-record/select/components/MultipleRecordSelectDropdown';
import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';
import { useCombinedViewFilters } from '@/views/hooks/useCombinedViewFilters';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_RECORDS_TO_DISPLAY = 3;

type ObjectFilterDropdownSourceSelectProps = {
  viewComponentId?: string;
};

export const ObjectFilterDropdownSourceSelect = ({
  viewComponentId,
}: ObjectFilterDropdownSourceSelectProps) => {
  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedOperandInDropdownState,
    selectedFilterState,
    setObjectFilterDropdownSelectedRecordIds,
    objectFilterDropdownSelectedRecordIdsState,
    selectFilter,
    emptyFilterButKeepDefinition,
  } = useFilterDropdown();

  const { removeCombinedViewFilter } = useCombinedViewFilters(viewComponentId);
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewComponentId);

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const objectFilterDropdownSearchInput = useRecoilValue(
    objectFilterDropdownSearchInputState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );
  const objectFilterDropdownSelectedRecordIds = useRecoilValue(
    objectFilterDropdownSelectedRecordIdsState,
  );
  const [fieldId] = useState(v4());

  const selectedFilter = useRecoilValue(selectedFilterState);

  // Dynamically update sourceEnumOptions based on selectedRecordIds
  const sourceEnumOptions: SelectableRecord[] = [
    {
      id: 'MANUAL',
      name: 'MANUAL',
      record: null,
      isSelected: objectFilterDropdownSelectedRecordIds.includes('MANUAL'),
    },
    {
      id: 'IMPORT',
      name: 'IMPORT',
      record: null,
      isSelected: objectFilterDropdownSelectedRecordIds.includes('IMPORT'),
    },
    {
      id: 'API',
      name: 'API',
      record: null,
      isSelected: objectFilterDropdownSelectedRecordIds.includes('API'),
    },
    {
      id: 'EMAIL',
      name: 'EMAIL',
      record: null,
      isSelected: objectFilterDropdownSelectedRecordIds.includes('EMAIL'),
    },
    {
      id: 'CALENDAR',
      name: 'CALENDAR',
      record: null,
      isSelected: objectFilterDropdownSelectedRecordIds.includes('CALENDAR'),
    },
  ];

  const filteredSelectedRecords = sourceEnumOptions.filter((option) =>
    objectFilterDropdownSelectedRecordIds.includes(option.id),
  );

  const handleMultipleRecordSelectChange = (
    recordToSelect: SelectableRecord,
    newSelectedValue: boolean,
  ) => {
    const newSelectedRecordIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, recordToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== recordToSelect.id,
        );

    if (newSelectedRecordIds.length === 0) {
      emptyFilterButKeepDefinition();
      removeCombinedViewFilter(fieldId);
      return;
    }

    setObjectFilterDropdownSelectedRecordIds(newSelectedRecordIds);

    const selectedRecordNames = sourceEnumOptions
      .filter((option) => newSelectedRecordIds.includes(option.id))
      .map((option) => option.name);

    const filterDisplayValue =
      selectedRecordNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedRecordNames.length} source types`
        : selectedRecordNames.join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedRecordIds.length > 0
          ? JSON.stringify(newSelectedRecordIds)
          : EMPTY_FILTER_VALUE;

      const viewFilter =
        currentViewWithCombinedFiltersAndSorts?.viewFilters.find(
          (viewFilter) =>
            viewFilter.fieldMetadataId ===
            filterDefinitionUsedInDropdown.fieldMetadataId,
        );

      const filterId = viewFilter?.id ?? fieldId;

      selectFilter({
        id: selectedFilter?.id ? selectedFilter.id : filterId,
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown || ViewFilterOperand.Is,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
      });
    }
  };

  return (
    <MultipleRecordSelectDropdown
      selectableListId="object-filter-source-select-id"
      hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
      recordsToSelect={sourceEnumOptions.filter(
        (record) =>
          !filteredSelectedRecords.some(
            (selected) => selected.id === record.id,
          ),
      )}
      filteredSelectedRecords={filteredSelectedRecords}
      selectedRecords={filteredSelectedRecords}
      onChange={handleMultipleRecordSelectChange}
      searchFilter={objectFilterDropdownSearchInput}
      loadingRecords={false}
    />
  );
};
