import { type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
  parseJson,
} from 'twenty-shared/utils';

import { type CoreObjectFilterField } from '@/object-core/filters/types/CoreObjectFilterField';
import { findCoreObjectFilterField } from '@/object-core/filters/utils/findCoreObjectFilterField';
import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';

const isEmptyValue = ({
  value,
  selectedField,
}: {
  value: string;
  selectedField: CoreObjectFilterField;
}): boolean => {
  if (selectedField.filterType === 'MULTI_SELECT') {
    const parsedValue = parseJson<unknown>(value);

    return Array.isArray(parsedValue)
      ? parsedValue.length === 0
      : value.trim() === '';
  }

  return value.trim() === '';
};

export const isUsableCoreObjectFilterRule = ({
  stepFilter,
  filterFields,
}: {
  stepFilter: StepFilter;
  filterFields: CoreObjectFilterField[];
}): boolean => {
  const selectedField = findCoreObjectFilterField({
    filterFields,
    fieldKey: stepFilter.stepOutputKey,
  });

  if (
    !isDefined(selectedField) ||
    !getStepFilterOperands({
      filterType: selectedField.filterType,
      subFieldName: undefined,
    }).includes(stepFilter.operand)
  ) {
    return false;
  }

  return (
    !isRecordFilterOperandExpectingValue(stepFilter.operand) ||
    !isEmptyValue({ value: stepFilter.value, selectedField })
  );
};
