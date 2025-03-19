import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

type WorkflowFormFieldSettingsTextProps = {
  id: string;
  label?: string;
  placeholder?: string;
  onFieldUpdate: (id: string, field: string, value: any) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsText = ({
  id,
  label,
  placeholder,
  onFieldUpdate,
}: WorkflowFormFieldSettingsTextProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onPersist={(newLabel: string | null) => {
            onFieldUpdate(id, 'label', newLabel);
          }}
          defaultValue={label ?? t`Text`}
          placeholder={t`Set your label`}
          color={theme.font.color.light}
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Placeholder</InputLabel>
        <FormTextFieldInput
          onPersist={(newPlaceholder: string | null) => {
            onFieldUpdate(id, 'placeholder', newPlaceholder);
          }}
          defaultValue={placeholder ?? 'Enter your text'}
          placeholder={t`Set your placeholder`}
          color={theme.font.color.light}
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
