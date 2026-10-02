import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { createElement, useContext, useMemo } from 'react';
import { Key } from 'ts-key-enum';

import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  type CountryChoice,
  CountrySelect as SharedCountrySelect,
} from 'twenty-ui/components';

const StyledClickOutsideListenerExclusion = styled.div`
  display: contents;
`;

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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    SELECT_COUNTRY_DROPDOWN_ID,
  );
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const countryChoices = useMemo<CountryChoice[]>(
    () =>
      countries.map(({ countryName, Flag }) => ({
        value: countryName,
        label: countryName,
        flag: <Flag width="100%" height="100%" />,
      })),
    [countries],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDropdown(SELECT_COUNTRY_DROPDOWN_ID);
      return;
    }

    openDropdown({
      dropdownComponentInstanceIdFromProps: SELECT_COUNTRY_DROPDOWN_ID,
    });
  };

  return (
    <DropdownComponentInstanceContext.Provider
      value={{ instanceId: SELECT_COUNTRY_DROPDOWN_ID }}
    >
      <DropdownCleanupEffect dropdownId={SELECT_COUNTRY_DROPDOWN_ID} />
      <SharedCountrySelect
        countries={countryChoices}
        value={selectedCountryName}
        onValueChange={onChange}
        label={label}
        labels={{
          search: t`Search`,
          noCountry: t`No country`,
          noResults: t`No results`,
        }}
        open={isDropdownOpen}
        onOpenChange={handleOpenChange}
        onKeyDown={(event) => {
          if (event.key === Key.Enter) {
            event.stopPropagation();
          }
        }}
        popupProps={{
          width: GenericDropdownContentWidth.Medium,
          sideOffset: 0,
          render: (popupProps) =>
            createElement(
              'div',
              {
                ...popupProps,
                'data-click-outside-id': parentClickOutsideId,
              },
              isDefined(excludedClickOutsideId) ? (
                <StyledClickOutsideListenerExclusion
                  data-click-outside-id={excludedClickOutsideId}
                >
                  {popupProps.children}
                </StyledClickOutsideListenerExclusion>
              ) : (
                popupProps.children
              ),
            ),
        }}
      />
    </DropdownComponentInstanceContext.Provider>
  );
};
