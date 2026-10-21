import { RecordFormSelectFieldInput } from '@/object-record/record-form/components/RecordFormSelectFieldInput';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { IconCircleOff, type IconComponentProps } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

type RecordFormCountrySelectInputProps = {
  label?: string;
  selectedCountryName: string;
  onChange: (countryName: string) => void;
  readonly?: boolean;
};

export const RecordFormCountrySelectInput = ({
  label,
  selectedCountryName,
  onChange,
  readonly,
}: RecordFormCountrySelectInputProps) => {
  const countries = useCountries();

  const options = useMemo<SelectOption[]>(
    () => [
      { label: t`No country`, value: '', Icon: IconCircleOff },
      ...countries.map<SelectOption>(({ countryName, Flag }) => ({
        label: countryName,
        value: countryName,
        Icon: (props: IconComponentProps) =>
          Flag({ width: props.size, height: props.size }),
      })),
    ],
    [countries],
  );

  return (
    <RecordFormSelectFieldInput
      label={label}
      options={options}
      defaultValue={selectedCountryName}
      onChange={(countryName) => onChange(countryName ?? '')}
      placeholder={t`Select a country`}
      readonly={readonly}
    />
  );
};
