import { t } from '@lingui/core/macro';
import { useMemo } from 'react';

import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { Select } from '@/ui/input/components/Select';
import { IconCircleOff, type IconComponentProps } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

export const CountrySelect = ({
  label,
  selectedCountryName,
  onChange,
}: {
  label: string;
  selectedCountryName: string;
  onChange: (countryCode: string) => void;
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
      label: t`No country`,
      value: '',
      Icon: IconCircleOff,
    });
    return countryList;
  }, [countries]);

  return (
    <Select
      fullWidth
      dropdownId={SELECT_COUNTRY_DROPDOWN_ID}
      options={options}
      label={label}
      withSearchInput
      onChange={onChange}
      value={selectedCountryName}
    />
  );
};
