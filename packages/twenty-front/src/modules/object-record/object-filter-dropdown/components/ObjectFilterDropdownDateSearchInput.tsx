import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';

export const ObjectFilterDropdownDateSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilterDropdown();

  const handleChange = (date: Date) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    selectFilter?.({
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: date.toISOString(),
      operand: selectedOperandInDropdown,
      displayValue: date.toLocaleDateString(),
      definition: filterDefinitionUsedInDropdown,
    });

    setIsObjectFilterDropdownUnfolded(false);
  };

  return (
    <InternalDatePicker
      date={new Date()}
      onChange={handleChange}
      onMouseSelect={handleChange}
    />
  );
};
