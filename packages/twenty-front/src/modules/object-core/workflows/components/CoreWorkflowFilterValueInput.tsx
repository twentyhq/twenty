import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { ViewFilterOperand, type StepFilter } from 'twenty-shared/types';
import {
  isDefined,
  isRecordFilterOperandExpectingValue,
  safeParseRelativeDateFilterJsonStringified,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import { findCoreWorkflowFilterField } from '@/object-core/workflows/utils/findCoreWorkflowFilterField';
import { FormDateTimeFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateTimeFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormRelativeDatePicker } from '@/object-record/record-field/ui/form-types/components/FormRelativeDatePicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';

type CoreWorkflowFilterValueInputProps = {
  stepFilter: StepFilter;
};

export const CoreWorkflowFilterValueInput = ({
  stepFilter,
}: CoreWorkflowFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const persistValue = (value: string) => {
    upsertStepFilterSettings({
      stepFilterToUpsert: { ...stepFilter, value },
    });
  };

  const selectedField = findCoreWorkflowFilterField(stepFilter.stepOutputKey);

  if (
    !isDefined(selectedField) ||
    !isRecordFilterOperandExpectingValue(stepFilter.operand)
  ) {
    return null;
  }

  if (selectedField.filterType === 'MULTI_SELECT') {
    return (
      <FormMultiSelectFieldInput
        key={`${stepFilter.id}-${stepFilter.operand}`}
        label=""
        defaultValue={stepFilter.value}
        options={(selectedField.options ?? []).map((option) => ({
          value: option.value,
          label: t(option.label),
          color: option.color,
        }))}
        onChange={(value) =>
          persistValue(
            typeof value === 'string' ? value : JSON.stringify(value),
          )
        }
        readonly={readonly}
      />
    );
  }

  if (selectedField.filterType === 'DATE_TIME') {
    if (stepFilter.operand === ViewFilterOperand.IS_RELATIVE) {
      const relativeDateFilter = safeParseRelativeDateFilterJsonStringified(
        stepFilter.value,
      );

      return (
        <FormRelativeDatePicker
          defaultValue={
            isDefined(relativeDateFilter)
              ? stringifyRelativeDateFilter(relativeDateFilter)
              : ''
          }
          onChange={(newRelativeDateFilter: RelativeDateFilter) =>
            persistValue(JSON.stringify(newRelativeDateFilter))
          }
          readonly={readonly}
          isDateTimeField
        />
      );
    }

    return (
      <FormDateTimeFieldInput
        key={`${stepFilter.id}-${stepFilter.operand}`}
        defaultValue={stepFilter.value}
        onChange={(value) => persistValue(value ?? '')}
        readonly={readonly}
      />
    );
  }

  return (
    <FormTextFieldInput
      key={`${stepFilter.id}-${stepFilter.operand}`}
      defaultValue={stepFilter.value}
      onChange={persistValue}
      readonly={readonly}
      placeholder={t`Enter value`}
    />
  );
};
