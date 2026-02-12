import { FormCountrySelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountrySelectInput';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { t } from '@lingui/core/macro';

type FormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressDraftValue | null;
  onChange: (value: FieldAddressValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormAddressFieldInput = ({
  label,
  defaultValue,
  onChange,
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
      onChange(updatedAddress);
    };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <FormNestedFieldInputContainer>
        <FormTextFieldInput
          label={t`Address 1`}
          defaultValue={defaultValue?.addressStreet1 ?? ''}
          onChange={handleChange('addressStreet1')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder={t`Street address`}
        />
        <FormTextFieldInput
          label={t`Address 2`}
          defaultValue={defaultValue?.addressStreet2 ?? ''}
          onChange={handleChange('addressStreet2')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder={t`Street address 2`}
        />
        <FormTextFieldInput
          label={t`City`}
          defaultValue={defaultValue?.addressCity ?? ''}
          onChange={handleChange('addressCity')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder={t`City`}
        />
        <FormTextFieldInput
          label={t`State`}
          defaultValue={defaultValue?.addressState ?? ''}
          onChange={handleChange('addressState')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder={t`State`}
        />
        <FormTextFieldInput
          label={t`Post Code`}
          defaultValue={defaultValue?.addressPostcode ?? ''}
          onChange={handleChange('addressPostcode')}
          readonly={readonly}
          VariablePicker={VariablePicker}
          placeholder={t`Post Code`}
        />
        <FormCountrySelectInput
          label={t`Country`}
          selectedCountryName={defaultValue?.addressCountry ?? ''}
          onChange={handleChange('addressCountry')}
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
