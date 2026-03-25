import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { t } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsDateProps = {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
};

export const WorkflowFormFieldSettingsDate = ({
  field,
  onChange,
}: WorkflowFormFieldSettingsDateProps) => {
  return (
    <FormFieldInputContainer>
      <InputLabel>{t`Label`}</InputLabel>
      <FormTextFieldInput
        onChange={(newLabel: string) => {
          onChange({
            ...field,
            label: newLabel,
            name: camelCase(newLabel),
          });
        }}
        defaultValue={field.label}
        placeholder={getDefaultFormFieldSettings(FieldMetadataType.DATE).label}
      />
    </FormFieldInputContainer>
  );
};
