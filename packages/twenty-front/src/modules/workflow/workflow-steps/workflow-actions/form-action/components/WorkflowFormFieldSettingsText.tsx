import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import styled from '@emotion/styled';
import camelCase from 'lodash.camelcase';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsTextProps = {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsText = ({
  field,
  onChange,
}: WorkflowFormFieldSettingsTextProps) => {
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
            getDefaultFormFieldSettings(FieldMetadataType.TEXT).label
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
            getDefaultFormFieldSettings(FieldMetadataType.TEXT).placeholder
          }
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
