import { useMemo } from 'react';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { IconCircleOff, IconComponentProps } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

export const FormCountrySelectInput = ({
  selectedCountryName,
  onChange,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryName: string;
  onChange: (country: string) => void;
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
        label: 'No country',
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
      label="Country"
      onChange={onCountryChange}
      options={options}
      defaultValue={selectedCountryName}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
