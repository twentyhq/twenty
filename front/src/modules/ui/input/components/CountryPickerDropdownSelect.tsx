import { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { DropdownMenuSearchInput } from '@/ui/dropdown/components/DropdownMenuSearchInput';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '@/ui/dropdown/components/StyledDropdownMenuSeparator';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/menu-item/components/MenuItemSelectAvatar';

import { Country } from './CountryPickerDropdownButton';

import 'react-phone-number-input/style.css';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  padding-right: ${({ theme }) => theme.spacing(1)};

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
  }
`;

const StyledDropdownMenuContainer = styled.ul`
  left: 0;
  padding: 0;
  position: absolute;
  top: 24px;
`;

export const CountryPickerDropdownSelect = ({
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
    <>
      <StyledDropdownMenuContainer data-select-disable>
        <StyledDropdownMenu width={'240px'}>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={(event) => setSearchFilter(event.currentTarget.value)}
            autoFocus
          />
          <StyledDropdownMenuSeparator />
          <StyledDropdownMenuItemsContainer hasMaxHeight>
            {filteredCountries?.length === 0 ? (
              <MenuItem text="No result" />
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
          </StyledDropdownMenuItemsContainer>
        </StyledDropdownMenu>
      </StyledDropdownMenuContainer>
    </>
  );
};
