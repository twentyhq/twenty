import {
  FormCountryCodeSelectInput,
  FormCountryCodeSelectInputUpdatedValue,
} from '@/object-record/record-field/form-types/components/FormCountryCodeSelectInput';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { getCountryCallingCode } from 'libphonenumber-js';

type FormPhoneFieldInputProps = {
  label?: string;
  defaultValue?: FieldPhonesValue;
  onPersist: (value: FieldPhonesValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormPhoneFieldInput = ({
  label,
  defaultValue,
  onPersist,
  readonly,
  VariablePicker,
}: FormPhoneFieldInputProps) => {
  const handleCountryChange = (
    newCountry: FormCountryCodeSelectInputUpdatedValue,
  ) => {
    let newCallingCode;
    if (newCountry === '') {
      newCallingCode = '';
    } else {
      newCallingCode = getCountryCallingCode(newCountry);
    }

    onPersist({
      primaryPhoneCountryCode: newCountry,
      primaryPhoneCallingCode: newCallingCode,
      primaryPhoneNumber: defaultValue?.primaryPhoneNumber || '',
    });
  };

  const handleNumberChange = (number: string | number | null) => {
    onPersist({
      primaryPhoneCountryCode: defaultValue?.primaryPhoneCountryCode || '',
      primaryPhoneCallingCode: defaultValue?.primaryPhoneCallingCode || '',
      primaryPhoneNumber: number ? `${number}` : '',
    });
  };

  return (
    <FormFieldInputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <FormNestedFieldInputContainer>
        <FormCountryCodeSelectInput
          selectedCountryCode={defaultValue?.primaryPhoneCountryCode || ''}
          onPersist={handleCountryChange}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormNumberFieldInput
          label="Phone Number"
          defaultValue={defaultValue?.primaryPhoneNumber || ''}
          onPersist={handleNumberChange}
          VariablePicker={VariablePicker}
          placeholder="Enter phone number"
          hint="Without calling code"
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
