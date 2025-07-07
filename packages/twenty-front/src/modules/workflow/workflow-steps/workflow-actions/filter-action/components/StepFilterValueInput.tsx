import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { StepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/StepFilterContext';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { StepFilter } from 'twenty-shared/src/types';

type StepFilterValueInputProps = {
  stepFilter: StepFilter;
};

export const StepFilterValueInput = ({
  stepFilter,
}: StepFilterValueInputProps) => {
  const { t } = useLingui();
  const { readonly, upsertStepFilter } = useContext(StepFilterContext);

  const handleValueChange = (value: string) => {
    upsertStepFilter?.({
      ...stepFilter,
      value,
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
