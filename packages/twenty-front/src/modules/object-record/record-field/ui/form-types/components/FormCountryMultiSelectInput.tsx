import { useMemo } from 'react';

import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { type IconComponentProps } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export const FormCountryMultiSelectInput = ({
  onChange,
  defaultValue,
  label,
  readonly = false,
  VariablePicker,
}: {
  onChange: (value: string | FieldMultiSelectValue) => void;
  defaultValue?: string | FieldMultiSelectValue;
  label?: string;
  readonly?: boolean;
  VariablePicker?: VariablePickerComponent;
}) => {
  const countries = useCountries();

  const options: SelectOption[] = useMemo(
    () =>
      countries.map<SelectOption>(({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      })),
    [countries],
  );

  const onCountryChange = (value: string | FieldMultiSelectValue) => {
    if (readonly) {
      return;
    }

    if (value === null) {
      onChange('');
    } else {
      onChange(value);
    }
  };

  return (
    <FormMultiSelectFieldInput
      label={label}
      onChange={onCountryChange}
      options={options}
      defaultValue={defaultValue}
      readonly={readonly}
      VariablePicker={VariablePicker}
    />
  );
};
