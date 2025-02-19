import { FormCountrySelectInput } from '@/object-record/record-field/form-types/components/FormCountrySelectInput';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FieldAddressDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { FieldAddressValue } from '@/object-record/record-field/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';

type FormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressDraftValue | null;
  onPersist: (value: FieldAddressValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormAddressFieldInput = ({
  label,
  defaultValue,
  onPersist,
  readonly,
  VariablePicker,
}: FormAddressFieldInputProps) => {
  const handleChange =
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      const updatedAddress = {
        addressStreet1: defaultValue?.addressStreet1 ?? '',
        addressStreet2: defaultValue?.addressStreet2 ?? '',
        addressCity: defaultValue?.addressCity ?? '',
        addressState: defaultValue?.addressState ?? '',
        addressPostcode: defaultValue?.addressPostcode ?? '',
        addressCountry: defaultValue?.addressCountry ?? '',
        addressLat: defaultValue?.addressLat ?? null,
        addressLng: defaultValue?.addressLng ?? null,
        [field]: updatedAddressPart,
      };
      onPersist(updatedAddress);
    };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label="Address 1"
          defaultValue={defaultValue?.addressStreet1 ?? ''}
          onPersist={handleChange('addressStreet1')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder="Street address"
        />
        <FormTextFieldInput
          label="Address 2"
          defaultValue={defaultValue?.addressStreet2 ?? ''}
          onPersist={handleChange('addressStreet2')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder="Street address 2"
        />
        <FormTextFieldInput
          label="City"
          defaultValue={defaultValue?.addressCity ?? ''}
          onPersist={handleChange('addressCity')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder="City"
        />
        <FormTextFieldInput
          label="State"
          defaultValue={defaultValue?.addressState ?? ''}
          onPersist={handleChange('addressState')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder="State"
        />
        <FormTextFieldInput
          label="Post Code"
          defaultValue={defaultValue?.addressPostcode ?? ''}
          onPersist={handleChange('addressPostcode')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder="Post Code"
        />
        <FormCountrySelectInput
          selectedCountryName={defaultValue?.addressCountry ?? ''}
          onPersist={handleChange('addressCountry')}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
