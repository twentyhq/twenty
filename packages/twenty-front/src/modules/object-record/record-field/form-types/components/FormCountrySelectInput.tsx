import { useMemo } from 'react';
import { IconCircleOff, IconComponentProps } from 'twenty-ui';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SelectOption } from '@/spreadsheet-import/types';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';

export const FormCountrySelectInput = ({
  selectedCountryName,
  onPersist,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryName: string;
  onPersist: (country: string) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(() => {
    const countryList = countries.map<SelectOption>(
      ({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        color: 'transparent',
        icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      }),
    );
    return [
      {
        label: 'No country',
        value: '',
        icon: IconCircleOff,
      },
      ...countryList,
    ];
  }, [countries]);

  const onChange = (country: string | null) => {
    if (readonly) {
      return;
    }

    if (country === null) {
      onPersist('');
    } else {
      onPersist(country);
    }
  };

  return (
    <FormSelectFieldInput
      label="Country"
      onPersist={onChange}
      options={options}
      defaultValue={selectedCountryName}
      readonly={readonly}
      VariablePicker={VariablePicker}
      placeholder="Select a country"
      preventDisplayPadding
    />
  );
};
