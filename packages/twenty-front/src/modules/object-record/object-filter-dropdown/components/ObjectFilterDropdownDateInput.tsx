import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { isDefined } from '~/utils/isDefined';

export const ObjectFilterDropdownDateInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const handleChange = (date: Date | null) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    selectFilter?.({
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: isDefined(date) ? date.toISOString() : '',
      operand: selectedOperandInDropdown,
      displayValue: isDefined(date) ? date.toLocaleString() : '',
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
