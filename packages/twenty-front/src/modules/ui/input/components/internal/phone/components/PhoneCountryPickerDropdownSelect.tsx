import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';

import { type Country } from '@/ui/input/components/internal/types/Country';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import 'react-phone-number-input/style.css';
import { MenuItem, MenuItemSelectAvatar } from 'twenty-ui/navigation';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  padding-right: ${({ theme }) => theme.spacing(1)};

  svg {
    align-items: center;
    border-radius: ${({ theme }) => theme.border.radius.xs};
    display: flex;
    height: 12px;
    justify-content: center;
  }
`;

export const PhoneCountryPickerDropdownSelect = ({
  countries,
  selectedCountry,
  onChange,
}: {
  countries: Country[];
  selectedCountry?: Country;
  onChange: (countryCode: string) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredCountries = useMemo(
    () =>
      countries.filter(({ countryName }) =>
        countryName
          .toLocaleLowerCase()
          .includes(searchFilter.toLocaleLowerCase()),
      ),
    [countries, searchFilter],
  );

  return (
    <DropdownContent>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.currentTarget.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredCountries?.length === 0 ? (
          <MenuItem text={t`No results`} />
        ) : (
          <>
            {selectedCountry && (
              <MenuItemSelectAvatar
                key={selectedCountry.countryCode}
                selected={true}
                onClick={() => onChange(selectedCountry.countryCode)}
                text={`${selectedCountry.countryName} (+${selectedCountry.callingCode})`}
                avatar={
                  <StyledIconContainer>
                    <selectedCountry.Flag />
                  </StyledIconContainer>
                }
              />
            )}
            {filteredCountries.map(
              ({ countryCode, countryName, callingCode, Flag }) =>
                selectedCountry?.countryCode === countryCode ? null : (
                  <MenuItemSelectAvatar
                    key={countryCode}
                    selected={selectedCountry?.countryCode === countryCode}
                    onClick={() => onChange(countryCode)}
                    text={`${countryName} (+${callingCode})`}
                    avatar={
                      <StyledIconContainer>
                        <Flag />
                      </StyledIconContainer>
                    }
                  />
                ),
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
