import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Field } from 'twenty-ui/primitives/input';
import { useLingui } from '@lingui/react/macro';

type FormEmailsFieldInputProps = {
  label?: string;
  defaultValue?: FieldEmailsValue;
  onChange: (value: FieldEmailsValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  subFieldPlaceholders?: Partial<Record<keyof FieldEmailsValue, string>>;
  isPrimaryEmailOnly?: boolean;
};

export const FormEmailsFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
  subFieldPlaceholders,
  isPrimaryEmailOnly = false,
}: FormEmailsFieldInputProps) => {
  const { t } = useLingui();

  const handleChange = (email: string) => {
    onChange({
      primaryEmail: email,
      additionalEmails: [],
    });
  };

  if (isPrimaryEmailOnly) {
    return (
      <FormTextFieldInput
        label={label}
        defaultValue={defaultValue?.primaryEmail}
        onChange={handleChange}
        placeholder={subFieldPlaceholders?.primaryEmail ?? t`Email`}
        readonly={readonly}
        VariablePicker={VariablePicker}
      />
    );
  }

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label={t`Primary Email`}
          defaultValue={defaultValue?.primaryEmail}
          onChange={handleChange}
          placeholder={subFieldPlaceholders?.primaryEmail ?? t`Primary Email`}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
