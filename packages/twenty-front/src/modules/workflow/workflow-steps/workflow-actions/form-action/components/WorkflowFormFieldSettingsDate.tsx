import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsDateProps = {
  label?: string;
  onChange: (fieldName: string, value: string | null) => void;
};

export const WorkflowFormFieldSettingsDate = ({
  label,
  onChange,
}: WorkflowFormFieldSettingsDateProps) => {
  return (
    <FormFieldInputContainer>
      <InputLabel>Label</InputLabel>
      <FormTextFieldInput
        onChange={(newLabel: string | null) => {
          onChange('label', newLabel);
        }}
        defaultValue={label}
        placeholder={getDefaultFormFieldSettings(FieldMetadataType.DATE).label}
      />
    </FormFieldInputContainer>
  );
};
