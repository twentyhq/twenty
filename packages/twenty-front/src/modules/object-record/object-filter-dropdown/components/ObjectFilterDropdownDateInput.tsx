import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { computeVariableDateViewFilterValue } from '@/views/utils/view-filter-value/computeVariableDateViewFilterValue';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import { resolveFilterValue } from '@/views/utils/view-filter-value/resolveFilterValue';
import { useState } from 'react';
import { isDefined } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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

  const selectedFilter = useRecoilValue(selectedFilterState) as
    | (Filter & { definition: { type: 'DATE' | 'DATE_TIME' } })
    | null
    | undefined;

  const initialFilterValue = selectedFilter
    ? resolveFilterValue(selectedFilter)
    : null;
  const [internalDate, setInternalDate] = useState<Date | null>(
    initialFilterValue instanceof Date ? initialFilterValue : null,
  );

  const isDateTimeInput =
    filterDefinitionUsedInDropdown?.type === FieldMetadataType.DateTime;

  const handleAbsoluteDateChange = (newDate: Date | null) => {
    setInternalDate(newDate);

    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    selectFilter?.({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value: newDate?.toISOString() ?? '',
      operand: selectedOperandInDropdown,
      displayValue: isDefined(newDate)
        ? isDateTimeInput
          ? newDate.toLocaleString()
          : newDate.toLocaleDateString()
        : '',
      definition: filterDefinitionUsedInDropdown,
    });

    setIsObjectFilterDropdownUnfolded(false);
  };

  const handleRelativeDateChange = (
    relativeDate: {
      direction: VariableDateViewFilterValueDirection;
      amount?: number;
      unit: VariableDateViewFilterValueUnit;
    } | null,
  ) => {
    if (!filterDefinitionUsedInDropdown || !selectedOperandInDropdown) return;

    const value = relativeDate
      ? computeVariableDateViewFilterValue(
          relativeDate.direction,
          relativeDate.amount,
          relativeDate.unit,
        )
      : '';

    selectFilter?.({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: filterDefinitionUsedInDropdown.fieldMetadataId,
      value,
      operand: selectedOperandInDropdown,
      displayValue: getRelativeDateDisplayValue(relativeDate),
      definition: filterDefinitionUsedInDropdown,
    });

    setIsObjectFilterDropdownUnfolded(false);
  };

  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IsRelative;

  const resolvedValue = selectedFilter
    ? resolveFilterValue(selectedFilter)
    : null;

  const relativeDate =
    resolvedValue && !(resolvedValue instanceof Date)
      ? resolvedValue
      : undefined;

  return (
    <InternalDatePicker
      relativeDate={relativeDate}
      highlightedDateRange={relativeDate}
      isRelative={isRelativeOperand}
      date={internalDate}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      onMouseSelect={handleAbsoluteDateChange}
      isDateTimeInput={isDateTimeInput}
    />
  );
};
