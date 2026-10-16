import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';

type RecordFormPickerFieldInputProps = {
  label?: string;
  picker: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readonly?: boolean;
  error?: string;
};

export const RecordFormPickerFieldInput = ({
  label,
  picker,
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
          <StyledTextInput
            id={instanceId}
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={readonly}
          />
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>

      {isNonEmptyString(error) ? (
        <Field.Error match>{error}</Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
