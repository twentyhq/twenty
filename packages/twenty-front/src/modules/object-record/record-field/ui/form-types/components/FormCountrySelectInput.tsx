import { t } from '@lingui/core/macro';
import { useMemo } from 'react';

import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { IconCircleOff, type IconComponentProps } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export const FormCountrySelectInput = ({
  selectedCountryName,
  onChange,
  label,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryName: string;
  onChange: (country: string) => void;
  label?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(() => {
    const countryList = countries.map<SelectOption>(
      ({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      }),
    );
    return [
      {
        label: t`No country`,
        value: '',
        Icon: IconCircleOff,
      },
      ...countryList,
    ];
  }, [countries]);

  const onCountryChange = (country: string | null) => {
    if (readonly) {
      return;
    }

    if (country === null) {
      onChange('');
    } else {
      onChange(country);
    }
  };

  return (
    <FormSelectFieldInput
      label={label}
      onChange={onCountryChange}
      options={options}
      defaultValue={selectedCountryName}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
