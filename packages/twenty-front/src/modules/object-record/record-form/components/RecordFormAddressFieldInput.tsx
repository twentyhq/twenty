import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { normalizeAddressFieldValueForPersist } from '@/object-record/record-field/ui/utils/normalizeAddressFieldValueForPersist';
import { RecordFormCountrySelectInput } from '@/object-record/record-form/components/RecordFormCountrySelectInput';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
import { Field } from 'twenty-ui/primitives/input';

type AddressTextPart = Exclude<
  keyof FieldAddressDraftValue,
  'addressCountry' | 'addressLat' | 'addressLng'
>;

type RecordFormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressDraftValue | null;
  onChange: (value: FieldAddressValue) => void;
  readonly?: boolean;
  subFieldPlaceholders?: Partial<Record<keyof FieldAddressDraftValue, string>>;
};

export const RecordFormAddressFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  subFieldPlaceholders,
}: RecordFormAddressFieldInputProps) => {
  const handlePartChange =
    (part: keyof FieldAddressDraftValue) => (newPartValue: string) =>
      onChange(
        normalizeAddressFieldValueForPersist({
          addressStreet1: defaultValue?.addressStreet1 ?? '',
          addressStreet2: defaultValue?.addressStreet2 ?? '',
          addressCity: defaultValue?.addressCity ?? '',
          addressState: defaultValue?.addressState ?? '',
          addressPostcode: defaultValue?.addressPostcode ?? '',
          addressCountry: defaultValue?.addressCountry ?? '',
          addressLat: defaultValue?.addressLat ?? null,
          addressLng: defaultValue?.addressLng ?? null,
          [part]: newPartValue,
        }),
      );

  const textParts: {
    part: AddressTextPart;
    label: string;
    placeholder: string;
  }[] = [
    {
      part: 'addressStreet1',
      label: t`Address 1`,
      placeholder: subFieldPlaceholders?.addressStreet1 ?? t`Street address`,
    },
    {
      part: 'addressStreet2',
      label: t`Address 2`,
      placeholder: subFieldPlaceholders?.addressStreet2 ?? t`Street address 2`,
    },
    {
      part: 'addressCity',
      label: t`City`,
      placeholder: subFieldPlaceholders?.addressCity ?? t`City`,
    },
    {
      part: 'addressState',
      label: t`State`,
      placeholder: subFieldPlaceholders?.addressState ?? t`State`,
    },
    {
      part: 'addressPostcode',
      label: t`Post Code`,
      placeholder: subFieldPlaceholders?.addressPostcode ?? t`Post Code`,
    },
  ];

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        {textParts.map(({ part, label: partLabel, placeholder }) => (
          <RecordFormTextInput
            key={part}
            label={partLabel}
            value={defaultValue?.[part] ?? ''}
            onChange={handlePartChange(part)}
            placeholder={placeholder}
            readonly={readonly}
          />
        ))}
        <RecordFormCountrySelectInput
          label={t`Country`}
          selectedCountryName={defaultValue?.addressCountry ?? ''}
          onChange={handlePartChange('addressCountry')}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
