import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { MultipleRecordSelectDropdown } from '@/object-record/select/components/MultipleRecordSelectDropdown';
import { useRecordsForSelect } from '@/object-record/select/hooks/useRecordsForSelect';
import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';
import { isDefined } from '~/utils/isDefined';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_RECORDS_TO_DISPLAY = 3;

export const ObjectFilterDropdownRecordSelect = () => {
  const {
    filterDefinitionUsedInDropdownState,
    objectFilterDropdownSearchInputState,
    selectedOperandInDropdownState,
    setObjectFilterDropdownSelectedRecordIds,
    objectFilterDropdownSelectedRecordIdsState,
    selectFilter,
    emptyFilterButKeepDefinition,
  } = useFilterDropdown();

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

  const objectNameSingular =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNameSingular ?? '';

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordsForSelect({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: objectFilterDropdownSelectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const handleMultipleRecordSelectChange = (
    recordToSelect: SelectableRecord,
    newSelectedValue: boolean,
  ) => {
    if (loading) {
      return;
    }

    const newSelectedRecordIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, recordToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== recordToSelect.id,
        );

    if (newSelectedRecordIds.length === 0) {
      emptyFilterButKeepDefinition();
      return;
    }

    setObjectFilterDropdownSelectedRecordIds(newSelectedRecordIds);

    const selectedRecordNames = [
      ...recordsToSelect,
      ...selectedRecords,
      ...filteredSelectedRecords,
    ]
      .filter(
        (record, index, self) =>
          self.findIndex((r) => r.id === record.id) === index,
      )
      .filter((record) => newSelectedRecordIds.includes(record.id))
      .map((record) => record.name);

    const filterDisplayValue =
      selectedRecordNames.length > MAX_RECORDS_TO_DISPLAY
        ? `${selectedRecordNames.length} companies`
        : selectedRecordNames.join(', ');

    if (
      isDefined(filterDefinitionUsedInDropdown) &&
      isDefined(selectedOperandInDropdown)
    ) {
      const newFilterValue =
        newSelectedRecordIds.length > 0
          ? JSON.stringify(newSelectedRecordIds)
          : EMPTY_FILTER_VALUE;

      selectFilter({
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: newFilterValue,
      });
    }
  };

  return (
    <MultipleRecordSelectDropdown
      recordsToSelect={recordsToSelect}
      filteredSelectedRecords={filteredSelectedRecords}
      selectedRecords={selectedRecords}
      onChange={handleMultipleRecordSelectChange}
      searchFilter={objectFilterDropdownSearchInput}
      loadingRecords={loading}
    />
  );
};
