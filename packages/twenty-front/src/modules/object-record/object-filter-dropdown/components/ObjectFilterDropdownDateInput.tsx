import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { DateFilterValue } from '@/object-record/object-filter-dropdown/types/DateFilterValue';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useState } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getDateFromDateFilterValue } from '../utils/getDateFromDateFilterValue';

export const ObjectFilterDropdownDateInput = () => {
  const {
    filterDefinitionUsedInDropdownState,
    selectedOperandInDropdownState,
    selectedFilterState,
    setIsObjectFilterDropdownUnfolded,
    selectFilter,
  } = useFilterDropdown();

  const filterDefinitionUsedInDropdown = useRecoilValue(
    filterDefinitionUsedInDropdownState,
  );
  const selectedOperandInDropdown = useRecoilValue(
    selectedOperandInDropdownState,
  );

  const selectedFilter = useRecoilValue(selectedFilterState);
  const dateFilterValue = selectedFilter?.value
    ? JSON.parse(selectedFilter.value)
    : null;
  const initialInternalDate = dateFilterValue
    ? getDateFromDateFilterValue(dateFilterValue)
    : new Date();
  const [internalDate, setInternalDate] = useState<Date | null>(
    initialInternalDate,
  );

  const isDateTimeInput =
    filterDefinitionUsedInDropdown?.type === FieldMetadataType.DateTime;

  const handleChange = (dateFilterValue: DateFilterValue | null) => {
    const newDate = dateFilterValue
      ? getDateFromDateFilterValue(dateFilterValue)
      : null;

    setInternalDate(newDate);

    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    selectFilter?.({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: JSON.stringify(dateFilterValue),
      operand: selectedOperandInDropdown,
      displayValue: newDate
        ? isDateTimeInput
          ? newDate.toLocaleString()
          : newDate.toLocaleDateString()
        : '',
      definition: filterDefinitionUsedInDropdown,
    });

    setIsObjectFilterDropdownUnfolded(false);
  };
  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IsRelative;

  return (
    <InternalDatePicker
      isRelativeToNow={isRelativeOperand}
      date={internalDate}
      onChange={(date) => {
        const dateFilterValue: DateFilterValue | null = date
          ? { type: 'absolute', isoString: date.toISOString() }
          : null;
        handleChange(dateFilterValue);
      }}
      onRelativeDateChange={handleChange}
      onMouseSelect={(date) => {
        const dateFilterValue: DateFilterValue | null = date
          ? { type: 'absolute', isoString: date.toISOString() }
          : null;
        handleChange(dateFilterValue);
      }}
      isDateTimeInput={isDateTimeInput}
    />
  );
};
