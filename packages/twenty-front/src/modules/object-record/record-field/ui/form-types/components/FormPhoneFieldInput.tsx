import {
  FormCallingCodeSelectInput,
  type FormCallingCodeSelectInputUpdatedValue,
} from '@/object-record/record-field/ui/form-types/components/FormCallingCodeSelectInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Field } from 'twenty-ui/primitives/input';
import { t } from '@lingui/core/macro';

type FormPhoneFieldInputProps = {
  label?: string;
  defaultValue?: FieldPhonesValue;
  onChange: (value: FieldPhonesValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormPhoneFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
}: FormPhoneFieldInputProps) => {
  const handleCallingCodeChange = (
    newValue: FormCallingCodeSelectInputUpdatedValue,
  ) => {
    onChange({
      primaryPhoneCountryCode: newValue.countryCode,
      primaryPhoneCallingCode: newValue.callingCode,
      primaryPhoneNumber: defaultValue?.primaryPhoneNumber ?? '',
    });
  };

  const handleNumberChange = (number: string) => {
    onChange({
      primaryPhoneCountryCode: defaultValue?.primaryPhoneCountryCode ?? '',
      primaryPhoneCallingCode: defaultValue?.primaryPhoneCallingCode ?? '',
      primaryPhoneNumber: number,
    });
  };

  return (
    <FormFieldInputContainer>
      {label && <Field.Label>{label}</Field.Label>}
      <FormNestedFieldInputContainer>
        <FormCallingCodeSelectInput
          label={t`Calling Code`}
          selectedCountryCode={defaultValue?.primaryPhoneCountryCode ?? ''}
          selectedCallingCode={defaultValue?.primaryPhoneCallingCode}
          onChange={handleCallingCodeChange}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormTextFieldInput
          label={t`Phone Number`}
          defaultValue={defaultValue?.primaryPhoneNumber ?? ''}
          onChange={handleNumberChange}
          VariablePicker={VariablePicker}
          placeholder={t`Enter phone number`}
          hint={t`Without calling code`}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
