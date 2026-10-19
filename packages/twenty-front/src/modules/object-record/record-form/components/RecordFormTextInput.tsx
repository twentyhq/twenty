import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { type ReactNode, useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSuffix = styled.span`
  align-items: center;
  align-self: stretch;
  border-inline-start: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type RecordFormTextInputProps = {
  label?: string;
  picker?: ReactNode;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readonly?: boolean;
  error?: string;
};

export const RecordFormTextInput = ({
  label,
  picker,
  suffix,
  value,
  onChange,
  placeholder,
  readonly,
  error,
}: RecordFormTextInputProps) => {
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
          <StyledTextInput
            id={instanceId}
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={readonly}
          />
          {isNonEmptyString(suffix) && <StyledSuffix>{suffix}</StyledSuffix>}
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>

      {isNonEmptyString(error) ? (
        <Field.Error match>{error}</Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
