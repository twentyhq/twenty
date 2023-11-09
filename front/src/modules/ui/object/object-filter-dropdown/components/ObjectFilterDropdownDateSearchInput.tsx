import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';

import { useFilter } from '../hooks/useFilter';

export const ObjectFilterDropdownDateSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilter();

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
