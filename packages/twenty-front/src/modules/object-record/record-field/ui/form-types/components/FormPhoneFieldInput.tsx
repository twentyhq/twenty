import {
  FormCallingCodeSelectInput,
  type FormCallingCodeSelectInputUpdatedValue,
} from '@/object-record/record-field/ui/form-types/components/FormCallingCodeSelectInput';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
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
        <FormCallingCodeSelectInput
          label={t`Calling Code`}
          selectedCountryCode={defaultValue?.primaryPhoneCountryCode ?? ''}
          selectedCallingCode={defaultValue?.primaryPhoneCallingCode}
          onChange={handleCallingCodeChange}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormNumberFieldInput
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
