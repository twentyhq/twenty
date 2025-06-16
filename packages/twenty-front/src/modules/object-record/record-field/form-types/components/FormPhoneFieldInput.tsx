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
  const handleCountryChange = (
    newCountry: FormCountryCodeSelectInputUpdatedValue,
  ) => {
    let newCallingCode;
    if (newCountry === '') {
      newCallingCode = '';
    } else {
      newCallingCode = getCountryCallingCode(newCountry);
    }

    onChange({
      primaryPhoneCountryCode: newCountry,
      primaryPhoneCallingCode: newCallingCode,
      primaryPhoneNumber: defaultValue?.primaryPhoneNumber ?? '',
    });
  };

  const handleNumberChange = (number: string | number | null) => {
    onChange({
      primaryPhoneCountryCode: defaultValue?.primaryPhoneCountryCode ?? '',
      primaryPhoneCallingCode: defaultValue?.primaryPhoneCallingCode ?? '',
      primaryPhoneNumber: number ? `${number}` : '',
    });
  };

  return (
    <FormFieldInputContainer>
      {label && <InputLabel>{label}</InputLabel>}
      <FormNestedFieldInputContainer>
        <FormCountryCodeSelectInput
          label="Country Code"
          selectedCountryCode={defaultValue?.primaryPhoneCountryCode ?? ''}
          onChange={handleCountryChange}
          readonly={readonly}
        />
        <FormNumberFieldInput
          label="Phone Number"
          defaultValue={defaultValue?.primaryPhoneNumber ?? ''}
          onChange={handleNumberChange}
          VariablePicker={VariablePicker}
          placeholder="Enter phone number"
          hint="Without calling code"
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
