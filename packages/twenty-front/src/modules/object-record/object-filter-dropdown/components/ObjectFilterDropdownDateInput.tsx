import { v4 } from 'uuid';

import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { computeVariableDateViewFilterValue } from '@/views/view-filter-value/utils/computeVariableDateViewFilterValue';
import {
  resolveDateViewFilterValue,
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { useState } from 'react';
import { isDefined } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const ObjectFilterDropdownDateInput = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const initialFilterValue = selectedFilter
    ? resolveDateViewFilterValue(selectedFilter)
    : null;
  const [internalDate, setInternalDate] = useState<Date | null>(
    initialFilterValue instanceof Date ? initialFilterValue : null,
  );

  const isDateTimeInput =
    fieldMetadataItemUsedInDropdown?.type === FieldMetadataType.DATE_TIME;

  const handleAbsoluteDateChange = (newDate: Date | null) => {
    setInternalDate(newDate);

    if (!fieldMetadataItemUsedInDropdown || !selectedOperandInDropdown) return;

    const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
      field: fieldMetadataItemUsedInDropdown,
    });

    applyRecordFilter({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      definition: filterDefinition,
      fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
      value: newDate?.toISOString() ?? '',
      operand: selectedOperandInDropdown,
      displayValue: isDefined(newDate)
        ? isDateTimeInput
          ? newDate.toLocaleString()
          : newDate.toLocaleDateString()
        : '',
      viewFilterGroupId: selectedFilter?.viewFilterGroupId,
    });
  };

  const handleRelativeDateChange = (
    relativeDate: {
      direction: VariableDateViewFilterValueDirection;
      amount?: number;
      unit: VariableDateViewFilterValueUnit;
    } | null,
  ) => {
    if (!fieldMetadataItemUsedInDropdown || !selectedOperandInDropdown) return;

    const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
      field: fieldMetadataItemUsedInDropdown,
    });

    const value = relativeDate
      ? computeVariableDateViewFilterValue(
          relativeDate.direction,
          relativeDate.amount,
          relativeDate.unit,
        )
      : '';

    applyRecordFilter({
      id: selectedFilter?.id ? selectedFilter.id : v4(),
      fieldMetadataId: fieldMetadataItemUsedInDropdown.id,
      value,
      operand: selectedOperandInDropdown,
      displayValue: getRelativeDateDisplayValue(relativeDate),
      definition: filterDefinition,
      viewFilterGroupId: selectedFilter?.viewFilterGroupId,
    });
  };

  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IsRelative;

  const resolvedValue = selectedFilter
    ? resolveDateViewFilterValue(selectedFilter)
    : null;

  const relativeDate =
    resolvedValue && !(resolvedValue instanceof Date)
      ? resolvedValue
      : undefined;

  return (
    <DateTimePicker
      relativeDate={relativeDate}
      highlightedDateRange={relativeDate}
      isRelative={isRelativeOperand}
      date={internalDate}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      onClose={handleAbsoluteDateChange}
      isDateTimeInput={isDateTimeInput}
    />
  );
};
