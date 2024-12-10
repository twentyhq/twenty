import { useMemo } from 'react';
import { IconCircleOff, IconComponentProps } from 'twenty-ui';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { SelectOption } from '@/ui/input/components/Select';

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

  const options: SelectOption<string>[] = useMemo(() => {
    const countryList = countries.map<SelectOption<string>>(
      ({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }), // TODO : improve this ?
      }),
    );
    countryList.unshift({
      label: 'No country',
      value: '',
      Icon: IconCircleOff,
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
      isNullable
      VariablePicker={VariablePicker}
    />
  );
};
