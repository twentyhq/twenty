import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAddressFieldValueForPersist } from '@/object-record/record-field/ui/utils/normalizeAddressFieldValueForPersist';
import { AddressInput } from '@/ui/field/input/components/AddressInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { type AllowedAddressSubField } from 'twenty-shared/types';
import { Field } from 'twenty-ui/primitives/input';

const EMPTY_ADDRESS_VALUE: FieldAddressValue = {
  addressStreet1: '',
  addressStreet2: null,
  addressCity: null,
  addressState: null,
  addressPostcode: null,
  addressCountry: null,
  addressLat: null,
  addressLng: null,
};

type RecordFormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressValue;
  onChange: (value: FieldAddressValue) => void;
  readonly?: boolean;
  placeholder?: string;
  subFields?: AllowedAddressSubField[] | null;
};

export const RecordFormAddressFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
  subFields,
}: RecordFormAddressFieldInputProps) => {
  const instanceId = useId();

  const handleChange = (updatedAddress: FieldAddressDraftValue) => {
    onChange(normalizeAddressFieldValueForPersist(updatedAddress));
  };

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <AddressInput
        instanceId={instanceId}
        variant="inline"
        value={defaultValue ?? EMPTY_ADDRESS_VALUE}
        onChange={handleChange}
        placeholder={placeholder}
        subFields={subFields}
        disabled={readonly}
      />
    </FormFieldInputContainer>
  );
};
