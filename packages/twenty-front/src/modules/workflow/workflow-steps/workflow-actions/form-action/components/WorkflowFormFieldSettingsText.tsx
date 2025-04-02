import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import styled from '@emotion/styled';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsTextProps = {
  label?: string;
  placeholder?: string;
  onChange: (fieldName: string, value: string | null) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsText = ({
  label,
  placeholder,
  onChange,
}: WorkflowFormFieldSettingsTextProps) => {
  return (
    <StyledContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onChange={(newLabel: string | null) => {
            onChange('label', newLabel);
          }}
          defaultValue={label}
          placeholder={
            getDefaultFormFieldSettings(FieldMetadataType.TEXT).label
          }
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Placeholder</InputLabel>
        <FormTextFieldInput
          onChange={(newPlaceholder: string | null) => {
            onChange('placeholder', newPlaceholder);
          }}
          defaultValue={placeholder}
          placeholder={
            getDefaultFormFieldSettings(FieldMetadataType.TEXT).placeholder
          }
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
