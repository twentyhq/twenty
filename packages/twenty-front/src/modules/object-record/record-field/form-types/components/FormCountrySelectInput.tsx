import { useMemo } from 'react';
import { IconCircleOff, IconComponentProps } from 'twenty-ui';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SelectOption } from '@/spreadsheet-import/types';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';

export const FormCountrySelectInput = ({
  selectedCountryName,
  onPersist,
  readonly,
  VariablePicker,
}: {
  selectedCountryName: string;
  onPersist: (countryCode: string) => void;
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
          Flag({ width: props.size, height: props.size }), // TODO : improve this ?
      }),
    );
    countryList.unshift({
      label: 'No country',
      value: '',
      icon: IconCircleOff,
    });
    return countryList;
  }, [countries]);

  const onChange = (countryCode: string | null) => {
    if (countryCode === null) {
      onPersist('');
    } else {
      onPersist(countryCode);
    }
  };

  return (
    <FormSelectFieldInput
      label="Country"
      onPersist={onChange}
      options={options}
      defaultValue={selectedCountryName}
      VariablePicker={VariablePicker}
    />
  );
};
