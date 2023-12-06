import { MultipleRecordSelectDropdown } from '@/object-record/select/components/MultipleRecordSelectDropdown';
import { useRecordSearchQuery } from '@/object-record/select/hooks/useRecordSearchQuery';
import { RecordToSelect } from '@/object-record/select/types/RecordToSelect';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';

export const ObjectFilterDropdownEntitySelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    selectedOperandInDropdown,
    setObjectFilterDropdownSelectedRecordIds,
    objectFilterDropdownSelectedRecordIds,
    selectFilter,
  } = useFilterDropdown();

  const objectNameSingular =
    filterDefinitionUsedInDropdown?.relationObjectMetadataNameSingular ?? '';

  const { loading, filteredSelectedRecords, recordsToSelect, selectedRecords } =
    useRecordSearchQuery({
      searchFilterText: objectFilterDropdownSearchInput,
      selectedIds: objectFilterDropdownSelectedRecordIds,
      objectNameSingular,
      limit: 10,
    });

  const handleMultipleRecordSelectChange = (
    recordToSelect: RecordToSelect,
    newSelectedValue: boolean,
  ) => {
    const newSelectedRecordIds = newSelectedValue
      ? [...objectFilterDropdownSelectedRecordIds, recordToSelect.id]
      : objectFilterDropdownSelectedRecordIds.filter(
          (id) => id !== recordToSelect.id,
        );

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
      selectedRecordNames.length > 3
        ? `${selectedRecordNames.length} companies`
        : selectedRecordNames.join(', ');

    if (filterDefinitionUsedInDropdown && selectedOperandInDropdown) {
      selectFilter({
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: filterDisplayValue,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value:
          newSelectedRecordIds.length > 0
            ? JSON.stringify(newSelectedRecordIds)
            : '',
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
