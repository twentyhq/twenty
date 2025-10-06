import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';

type FieldImageFormValue = { attachmentIds: string[] };

type FormImageFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: FieldImageFormValue | null | undefined;
  onChange: (value: FieldImageFormValue | null) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
  placeholder?: string;
};

const StyledPlaceholder = styled.div`
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

const StyledSubText = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const FormImageFieldInput = ({
  label,
  error,
  defaultValue,
  onChange,
  readonly,
}: FormImageFieldInputProps) => {
  const attachmentCount = Array.isArray(defaultValue?.attachmentIds)
    ? defaultValue?.attachmentIds.length
    : 0;

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledPlaceholder>
          Image Field ({attachmentCount} images)
          <StyledSubText>
            {readonly
              ? 'Read-only placeholder'
              : 'Upload functionality coming soon'}
          </StyledSubText>
        </StyledPlaceholder>
      </FormFieldInputRowContainer>

      {error && <InputErrorHelper>{error}</InputErrorHelper>}
    </FormFieldInputContainer>
  );
};
