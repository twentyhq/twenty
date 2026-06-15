import { useMemo } from 'react';

import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { t } from '@lingui/core/macro';
import { IconCircleOff, type IconComponentProps } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export type FormCallingCodeSelectInputUpdatedValue = {
  callingCode: string;
  countryCode: string;
};

export const FormCallingCodeSelectInput = ({
  selectedCountryCode,
  selectedCallingCode,
  onChange,
  label,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryCode: string;
  selectedCallingCode?: string;
  onChange: (value: FormCallingCodeSelectInputUpdatedValue) => void;
  label?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(() => {
    const countryList = countries.map<SelectOption>(
      ({ countryName, countryCode, callingCode, Flag }) => ({
        label: `+${callingCode} (${countryName})`,
        value: countryCode,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      }),
    );
    return [
      {
        label: t`No calling code`,
        value: '',
        Icon: IconCircleOff,
      },
      ...countryList,
    ];
  }, [countries]);

  const defaultValue = isStandaloneVariableString(selectedCallingCode)
    ? selectedCallingCode
    : selectedCountryCode;

  const handleChange = (value: string | null) => {
    if (readonly) {
      return;
    }

    if (value === null) {
      onChange({ callingCode: '', countryCode: '' });
      return;
    }

    if (isStandaloneVariableString(value)) {
      onChange({ callingCode: value, countryCode: '' });
      return;
    }

    const matchingCountry = countries.find(
      (countryItem) => countryItem.countryCode === value,
    );

    const callingCode = matchingCountry?.callingCode;

    onChange({
      callingCode: callingCode ? `+${callingCode}` : '',
      countryCode: value,
    });
  };

  return (
    <FormSelectFieldInput
      label={label}
      onChange={handleChange}
      options={options}
      defaultValue={defaultValue}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
