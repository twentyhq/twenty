import { t } from '@lingui/core/macro';
import { type KeyboardEvent, useId, useMemo } from 'react';
import { PhoneCountryPicker } from 'twenty-ui/components/input';

import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

type PhoneCountryPickerDropdownButtonProps = {
  value?: string;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

const keepEnterAwayFromFieldHotkeys = (
  event: KeyboardEvent<HTMLButtonElement>,
) => {
  if (event.key !== 'Enter') {
    return;
  }

  event.stopPropagation();
};

export const PhoneCountryPickerDropdownButton = ({
  value,
  onChange,
  disabled,
  readOnly,
}: PhoneCountryPickerDropdownButtonProps) => {
  const dropdownId = useId();
  const availableCountries = useCountries();
  const countries = useMemo(
    () =>
      availableCountries.map(
        ({ countryCode, countryName, callingCode, Flag }) => ({
          value: countryCode,
          label: countryName,
          callingCode,
          flag: <Flag />,
        }),
      ),
    [availableCountries],
  );
  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <PhoneCountryPicker.Trigger
        country={selectedCountry}
        disabled={disabled || readOnly}
        aria-label={t`Country`}
        onKeyDown={keepEnterAwayFromFieldHotkeys}
      />
      <DropdownContent
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
      >
        <PhoneCountryPicker.Options
          countries={countries}
          value={value}
          onValueChange={onChange}
          searchLabel={t`Search`}
          emptyLabel={t`No results`}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
