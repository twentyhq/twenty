import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { StepFilter } from 'twenty-shared/src/types';

type WorkflowStepFilterValueInputProps = {
  stepFilter: StepFilter;
};

export const WorkflowStepFilterValueInput = ({
  stepFilter,
}: WorkflowStepFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const handleValueChange = (value: string) => {
    upsertStepFilterSettings({
      stepFilterToUpsert: {
        ...stepFilter,
        value,
      },
    });
  };

  return (
    <FormTextFieldInput
      defaultValue={stepFilter.value}
      onChange={handleValueChange}
      readonly={readonly}
      VariablePicker={WorkflowVariablePicker}
      placeholder={t`Enter value`}
    />
  );
};
