import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledAffix = styled.span<{ isPrefix?: boolean }>`
  align-items: center;
  align-self: stretch;
  border-left: ${({ isPrefix }) =>
    isPrefix ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};
  border-right: ${({ isPrefix }) =>
    isPrefix ? `1px solid ${themeCssVariables.border.color.medium}` : 'none'};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type RecordFormPickerFieldInputProps = {
  label?: string;
  picker?: ReactNode;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readonly?: boolean;
  error?: string;
};

export const RecordFormPickerFieldInput = ({
  label,
  picker,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  readonly,
  error,
}: RecordFormPickerFieldInputProps) => {
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? (
        <Field.Label htmlFor={instanceId}>{label}</Field.Label>
      ) : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
        >
          {picker}
          {isNonEmptyString(prefix) && (
            <StyledAffix isPrefix>{prefix}</StyledAffix>
          )}
          <StyledTextInput
            id={instanceId}
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={readonly}
          />
          {isNonEmptyString(suffix) && <StyledAffix>{suffix}</StyledAffix>}
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>

      {isNonEmptyString(error) ? (
        <Field.Error match>{error}</Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
