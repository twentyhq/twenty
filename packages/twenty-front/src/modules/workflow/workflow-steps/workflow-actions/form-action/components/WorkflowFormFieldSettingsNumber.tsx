import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import styled from '@emotion/styled';
import camelCase from 'lodash.camelcase';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsNumberProps = {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsNumber = ({
  field,
  onChange,
}: WorkflowFormFieldSettingsNumberProps) => {
  return (
    <StyledContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onChange={(newLabel: string) => {
            onChange({
              ...field,
              label: newLabel,
              name: camelCase(newLabel),
            });
          }}
          defaultValue={field.label}
          placeholder={
            getDefaultFormFieldSettings(FieldMetadataType.NUMBER).label
          }
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Placeholder</InputLabel>
        <FormTextFieldInput
          onChange={(newPlaceholder: string) => {
            onChange({
              ...field,
              placeholder: newPlaceholder,
            });
          }}
          defaultValue={field.placeholder}
          placeholder={
            getDefaultFormFieldSettings(FieldMetadataType.NUMBER).placeholder
          }
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
