import { MultipleRecordSelectDropdown } from '@/object-record/select/components/MultipleRecordSelectDropdown';
import { useRecordSearchQuery } from '@/object-record/select/hooks/useRecordSearchQuery';
import { RecordToSelect } from '@/object-record/select/types/RecordToSelect';
import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';

export const ObjectFilterDropdownEntitySelect = () => {
  const {
    filterDefinitionUsedInDropdown,
    objectFilterDropdownSearchInput,
    selectedOperandInDropdown,
    objectFilterDropdownSelectedEntityId,
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
    setObjectFilterDropdownSelectedRecordIds((prevSelectedIds) => {
      if (newSelectedValue) {
        return [...prevSelectedIds, recordToSelect.id];
      }

      return prevSelectedIds.filter((id) => id !== recordToSelect.id);
    });

    const selectedIdsDisplayName = recordsToSelect
      .filter((record) => record.isSelected)
      .map((record) => record.name)
      .join(', ');

    // Set filter
    if (filterDefinitionUsedInDropdown && selectedOperandInDropdown) {
      selectFilter({
        definition: filterDefinitionUsedInDropdown,
        operand: selectedOperandInDropdown,
        displayValue: selectedIdsDisplayName,
        fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
        value: JSON.stringify(objectFilterDropdownSelectedRecordIds),
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
    />
  );
};
