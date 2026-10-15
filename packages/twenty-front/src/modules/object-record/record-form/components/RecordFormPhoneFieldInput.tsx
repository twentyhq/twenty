import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormPickerFieldInput } from '@/object-record/record-form/components/RecordFormPickerFieldInput';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type RecordFormPhoneFieldInputProps = {
  label?: string;
  defaultValue?: FieldPhonesValue;
  defaultCountryCode?: string;
  onChange: (value: FieldPhonesValue) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormPhoneFieldInput = ({
  label,
  defaultValue,
  defaultCountryCode,
  onChange,
  readonly,
  placeholder,
}: RecordFormPhoneFieldInputProps) => {
  const countries = useCountries();

  const countryCode = isNonEmptyString(defaultValue?.primaryPhoneCountryCode)
    ? defaultValue.primaryPhoneCountryCode
    : defaultCountryCode;

  const handlePhoneChange = ({
    newCountryCode,
    newNumber,
  }: {
    newCountryCode: string | undefined;
    newNumber: string;
  }) => {
    const country = countries.find(
      (candidate) => candidate.countryCode === newCountryCode,
    );

    onChange({
      primaryPhoneNumber: newNumber,
      primaryPhoneCountryCode: country?.countryCode ?? '',
      primaryPhoneCallingCode: isDefined(country)
        ? `+${country.callingCode}`
        : '',
      additionalPhones: defaultValue?.additionalPhones ?? null,
    });
  };

  return (
    <RecordFormPickerFieldInput
      label={label}
      value={defaultValue?.primaryPhoneNumber ?? ''}
      onChange={(newNumber) =>
        handlePhoneChange({ newCountryCode: countryCode, newNumber })
      }
      placeholder={placeholder ?? t`Enter phone number`}
      readonly={readonly}
      picker={
        <PhoneCountryPickerDropdownButton
          value={countryCode}
          onChange={(newCountryCode) =>
            handlePhoneChange({
              newCountryCode,
              newNumber: defaultValue?.primaryPhoneNumber ?? '',
            })
          }
          disabled={readonly}
        />
      }
    />
  );
};
