import { t } from '@lingui/core/macro';
import { createElement, useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';

import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { DropdownClickOutsideListenerExclusion } from '@/ui/layout/dropdown/components/DropdownClickOutsideListenerExclusion';
import { useHandleDropdownOpenChange } from '@/ui/layout/dropdown/hooks/useHandleDropdownOpenChange';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import {
  type CountryChoice,
  CountrySelect as SharedCountrySelect,
} from 'twenty-ui/components/input';

type CountrySelectProps = {
  label: string;
  selectedCountryName: string;
  onChange: (countryName: string) => void;
};

export const CountrySelect = ({
  label,
  selectedCountryName,
  onChange,
}: CountrySelectProps) => {
  const countries = useCountries();
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    SELECT_COUNTRY_DROPDOWN_ID,
  );
  const { handleDropdownOpenChange } = useHandleDropdownOpenChange({
    dropdownId: SELECT_COUNTRY_DROPDOWN_ID,
  });

  const countryChoices = useMemo<CountryChoice[]>(
    () =>
      countries.map(({ countryName, Flag }) => ({
        value: countryName,
        label: countryName,
        flag: <Flag width="100%" height="100%" />,
      })),
    [countries],
  );

  return (
    <>
      <DropdownCleanupEffect dropdownId={SELECT_COUNTRY_DROPDOWN_ID} />
      <SharedCountrySelect
        countries={countryChoices}
        value={selectedCountryName}
        onValueChange={onChange}
        label={label}
        searchLabel={t`Search`}
        noCountryLabel={t`No country`}
        noResultsLabel={t`No results`}
        open={isDropdownOpen}
        onOpenChange={handleDropdownOpenChange}
        onKeyDown={(event) => {
          if (event.key === Key.Enter) {
            event.stopPropagation();
          }
        }}
        popupProps={{
          render: (popupProps) =>
            createElement(
              'div',
              {
                ...popupProps,
                'data-click-outside-id': parentClickOutsideId,
              },
              <DropdownClickOutsideListenerExclusion>
                {popupProps.children}
              </DropdownClickOutsideListenerExclusion>,
            ),
        }}
      />
    </>
  );
};
