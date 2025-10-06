import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';

import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';

type FieldPdfFormValue = { attachmentIds: string[] };

type FormPdfFieldInputProps = {
  label?: string;
  error?: string;
  defaultValue: FieldPdfFormValue | null | undefined;
  onChange: (value: FieldPdfFormValue | null) => void;
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

export const FormPdfFieldInput = ({
  label,
  error,
  defaultValue,
  onChange,
  readonly,
}: FormPdfFieldInputProps) => {
  const attachmentCount = Array.isArray(defaultValue?.attachmentIds)
    ? defaultValue?.attachmentIds.length
    : 0;

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledPlaceholder>
          PDF Field ({attachmentCount} files)
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
