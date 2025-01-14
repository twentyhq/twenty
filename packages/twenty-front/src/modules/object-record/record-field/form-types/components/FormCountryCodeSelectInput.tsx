import { useMemo } from 'react';
import { IconCircleOff, IconComponentProps } from 'twenty-ui';

import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { SelectOption } from '@/spreadsheet-import/types';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';

export const FormCountryCodeSelectInput = ({
  selectedCountryCode,
  onPersist,
  readonly = false,
  VariablePicker,
}: {
  selectedCountryCode: string;
  onPersist: (countryCode: string) => void;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(() => {
    const countryList = countries.map<SelectOption>(
      ({ countryName, countryCode, callingCode, Flag }) => ({
        label: `${countryName} (+${callingCode})`,
        value: countryCode,
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

  const onChange = (countryCode: string | null) => {
    if (readonly) {
      return;
    }

    if (countryCode === null) {
      onPersist('');
    } else {
      onPersist(countryCode);
    }
  };

  return (
    <FormSelectFieldInput
      label="Country Code"
      onPersist={onChange}
      options={options}
      defaultValue={selectedCountryCode}
      readonly={readonly}
      VariablePicker={VariablePicker}
      preventDisplayPadding
    />
  );
};
