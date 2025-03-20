import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

type WorkflowFormFieldSettingsNumberProps = {
  label?: string;
  placeholder?: string;
  onChange: (fieldName: string, value: string | null) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsNumber = ({
  label,
  placeholder,
  onChange,
}: WorkflowFormFieldSettingsNumberProps) => {
  return (
    <StyledContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onChange={(newLabel: string | null) => {
            onChange('label', newLabel);
          }}
          defaultValue={label ?? t`Number`}
          placeholder={t`Text`}
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Placeholder</InputLabel>
        <FormTextFieldInput
          onChange={(newPlaceholder: string | null) => {
            onChange('placeholder', newPlaceholder);
          }}
          defaultValue={placeholder ?? '1000'}
          placeholder={'1000'}
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
