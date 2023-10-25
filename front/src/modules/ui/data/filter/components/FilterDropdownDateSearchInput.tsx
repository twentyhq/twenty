import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useUpsertFilter } from '@/views/hooks/useUpsertFilter';

import { useFilter } from '../hooks/useFilter';

export const FilterDropdownDateSearchInput = () => {
  const {
    filterDefinitionUsedInDropdown,
    selectedOperandInDropdown,
    setIsFilterDropdownUnfolded,
  } = useFilter();

  const upsertFilter = useUpsertFilter();

  const handleChange = (date: Date) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    upsertFilter({
      key: filterDefinitionUsedInDropdown.key,
      type: filterDefinitionUsedInDropdown.type,
      value: date.toISOString(),
      operand: selectedOperandInDropdown,
      displayValue: date.toLocaleDateString(),
    });

    setIsFilterDropdownUnfolded(false);
  };

  return (
    <InternalDatePicker
      date={new Date()}
      onChange={handleChange}
      onMouseSelect={handleChange}
    />
  );
};
