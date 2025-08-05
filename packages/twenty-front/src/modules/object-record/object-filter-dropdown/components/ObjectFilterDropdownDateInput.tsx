import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { computeVariableDateViewFilterValue } from '@/views/view-filter-value/utils/computeVariableDateViewFilterValue';
import {
  resolveDateViewFilterValue,
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
import { useState } from 'react';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const ObjectFilterDropdownDateInput = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const initialFilterValue = isDefined(objectFilterDropdownCurrentRecordFilter)
    ? resolveDateViewFilterValue(objectFilterDropdownCurrentRecordFilter)
    : null;

  const [internalDate, setInternalDate] = useState<Date | null>(
    initialFilterValue instanceof Date ? initialFilterValue : null,
  );

  const isDateTimeInput =
    fieldMetadataItemUsedInDropdown?.type === FieldMetadataType.DATE_TIME;

  const handleAbsoluteDateChange = (newDate: Date | null) => {
    setInternalDate(newDate);

    const newFilterValue = newDate?.toISOString() ?? '';
    const newDisplayValue = isDefined(newDate)
      ? isDateTimeInput
        ? newDate.toLocaleString()
        : newDate.toLocaleDateString()
      : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const handleRelativeDateChange = (
    relativeDate: {
      direction: VariableDateViewFilterValueDirection;
      amount?: number;
      unit: VariableDateViewFilterValueUnit;
    } | null,
  ) => {
    const newFilterValue = relativeDate
      ? computeVariableDateViewFilterValue(
          relativeDate.direction,
          relativeDate.amount,
          relativeDate.unit,
        )
      : '';

    const newDisplayValue = relativeDate
      ? getRelativeDateDisplayValue(relativeDate)
      : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IsRelative;

  const handleClear = () => {
    isRelativeOperand
      ? handleRelativeDateChange(null)
      : handleAbsoluteDateChange(null);
  };
  const resolvedValue = objectFilterDropdownCurrentRecordFilter
    ? resolveDateViewFilterValue(objectFilterDropdownCurrentRecordFilter)
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
      isDateTimeInput={isDateTimeInput}
      onClear={handleClear}
    />
  );
};
