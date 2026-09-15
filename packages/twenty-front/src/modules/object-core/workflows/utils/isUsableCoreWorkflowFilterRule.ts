import { type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
  parseJson,
} from 'twenty-shared/utils';

import { CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND } from '@/object-core/workflows/constants/CoreWorkflowFilterOperandByViewFilterOperand';
import { type CoreWorkflowFilterFieldDefinition } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';

const isEmptyValue = ({
  value,
  selectedField,
}: {
  value: string;
  selectedField: CoreWorkflowFilterFieldDefinition;
}): boolean => {
  if (selectedField.filterType === 'MULTI_SELECT') {
    const parsedValue = parseJson<unknown>(value);

    return Array.isArray(parsedValue)
      ? parsedValue.length === 0
      : value.trim() === '';
  }

  return value.trim() === '';
};

export const isUsableCoreWorkflowFilterRule = (
  stepFilter: StepFilter,
): boolean => {
  const selectedField = findCoreWorkflowFilterField(stepFilter.stepOutputKey);
  const operand =
    CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND[stepFilter.operand];

  if (!isDefined(selectedField) || !isDefined(operand)) {
    return false;
  }

  return (
    !isRecordFilterOperandExpectingValue(stepFilter.operand) ||
    !isEmptyValue({ value: stepFilter.value, selectedField })
  );
};
