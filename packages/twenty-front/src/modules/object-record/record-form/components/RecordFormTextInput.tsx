import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { StyledFieldInputSuffix } from '@/ui/field/input/components/StyledFieldInputSuffix';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';

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
          {isNonEmptyString(suffix) && (
            <StyledFieldInputSuffix>{suffix}</StyledFieldInputSuffix>
          )}
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>

      {isNonEmptyString(error) ? (
        <Field.Error match role="alert">
          {error}
        </Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
