import { t } from '@lingui/core/macro';
import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  parseJson,
  safeParseRelativeDateFilterJsonStringified,
} from 'twenty-shared/utils';

import { type CoreWorkflowFilterFieldDefinition } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { getOperandLabelShort } from '@/object-record/object-filter-dropdown/utils/getOperandLabel';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';

const getReadableValue = (
  stepFilter: StepFilter,
  selectedField: CoreWorkflowFilterFieldDefinition,
): string => {
  if (stepFilter.operand === ViewFilterOperand.IS_RELATIVE) {
    const relativeDateFilter = safeParseRelativeDateFilterJsonStringified(
      stepFilter.value,
    );

    return isDefined(relativeDateFilter)
      ? getRelativeDateDisplayValue(relativeDateFilter)
      : '';
  }

  const parsedValue = parseJson<string[]>(stepFilter.value);

  if (Array.isArray(parsedValue)) {
    return parsedValue
      .map((value) => {
        const option = selectedField.options?.find(
          (fieldOption) => fieldOption.value === value,
        );

        return isDefined(option) ? t(option.label) : value;
      })
      .join(', ');
  }

  if (selectedField.filterType === 'DATE_TIME') {
    const date = new Date(
      typeof parsedValue === 'string' ? parsedValue : stepFilter.value,
    );

    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  }

  return stepFilter.value;
};

export const getCoreWorkflowFilterChipLabel = (
  stepFilter: StepFilter,
): string => {
  const selectedField = findCoreWorkflowFilterField(stepFilter.stepOutputKey);

  if (!isDefined(selectedField)) {
    return '';
  }

  const readableValue = getReadableValue(stepFilter, selectedField);
  const operandLabel = getOperandLabelShort(stepFilter.operand);

  return `${t(selectedField.label)} ${operandLabel} ${readableValue}`.trim();
};
