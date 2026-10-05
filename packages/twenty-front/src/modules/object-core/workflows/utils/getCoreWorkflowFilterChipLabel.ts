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

const getReadableValue = ({
  stepFilter,
  selectedField,
  timezone,
}: {
  stepFilter: StepFilter;
  selectedField: CoreWorkflowFilterFieldDefinition;
  timezone: string | undefined;
}): string => {
  if (stepFilter.operand === ViewFilterOperand.IS_RELATIVE) {
    const relativeDateFilter = safeParseRelativeDateFilterJsonStringified(
      stepFilter.value,
    );

    return isDefined(relativeDateFilter)
      ? getRelativeDateDisplayValue(relativeDateFilter)
      : '';
  }

  if (selectedField.filterType === 'MULTI_SELECT') {
    const parsedValue = parseJson<string[]>(stepFilter.value);
    const selectedValues = Array.isArray(parsedValue)
      ? parsedValue
      : [stepFilter.value];

    return selectedValues
      .map((value) => {
        const option = selectedField.options?.find(
          (fieldOption) => fieldOption.value === value,
        );

        return isDefined(option) ? t(option.label) : value;
      })
      .join(', ');
  }

  if (selectedField.filterType === 'DATE_TIME') {
    const parsedValue = parseJson<string>(stepFilter.value);
    const date = new Date(
      typeof parsedValue === 'string' ? parsedValue : stepFilter.value,
    );

    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: timezone,
        }).format(date);
  }

  return stepFilter.value;
};

export const getCoreWorkflowFilterChipLabel = ({
  stepFilter,
  timezone,
}: {
  stepFilter: StepFilter;
  timezone?: string;
}): string => {
  const selectedField = findCoreWorkflowFilterField(stepFilter.stepOutputKey);

  if (!isDefined(selectedField)) {
    return '';
  }

  const readableValue = getReadableValue({
    stepFilter,
    selectedField,
    timezone,
  });
  const operandLabel = getOperandLabelShort(stepFilter.operand);

  return `${t(selectedField.label)} ${operandLabel} ${readableValue}`.trim();
};
