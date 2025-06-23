import { useMemo } from 'react';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import type { CountryCode } from 'libphonenumber-js';
import { IconCircleOff, IconComponentProps } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

export type FormCountryCodeSelectInputUpdatedValue = CountryCode | '';

export const FormCountryCodeSelectInput = ({
  selectedCountryCode,
  onChange,
  label,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryCode: string;
  onChange: (countryCode: FormCountryCodeSelectInputUpdatedValue) => void;
  label?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(() => {
    const countryList = countries.map<SelectOption>(
      ({ countryName, countryCode, callingCode, Flag }) => ({
        label: `${countryName} (+${callingCode})`,
        value: countryCode,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      }),
    );
    return [
      {
        label: 'No country',
        value: '',
        Icon: IconCircleOff,
      },
      ...countryList,
    ];
  }, [countries]);

  const onCountryCodeChange = (countryCode: string | null) => {
    if (readonly) {
      return;
    }

    if (countryCode === null) {
      onChange('');
    } else {
      onChange(countryCode as CountryCode);
    }
  };

  return (
    <FormSelectFieldInput
      label={label}
      onChange={onCountryCodeChange}
      options={options}
      defaultValue={selectedCountryCode}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
