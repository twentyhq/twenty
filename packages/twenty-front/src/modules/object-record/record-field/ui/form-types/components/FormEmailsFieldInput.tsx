import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';

type FormEmailsFieldInputProps = {
  label?: string;
  defaultValue?: FieldEmailsValue;
  onChange: (value: FieldEmailsValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormEmailsFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
}: FormEmailsFieldInputProps) => {
  const handleChange = (email: string) => {
    onChange({
      primaryEmail: email,
      additionalEmails: [],
    });
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label="Primary Email"
          defaultValue={defaultValue?.primaryEmail}
          onChange={handleChange}
          placeholder={'Primary Email'}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
