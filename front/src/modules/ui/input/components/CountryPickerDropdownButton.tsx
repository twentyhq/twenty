import { useEffect, useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { hasFlag } from 'country-flag-icons';
import * as Flags from 'country-flag-icons/react/3x2';
import { CountryCallingCode } from 'libphonenumber-js';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconChevronDown } from '@/ui/icon';

import { IconWorld } from '../constants/icons';
import { CountryPickerHotkeyScope } from '../Types/CountryPickerHotkeyScope';

import { CountryPickerDropdownSelect } from './CountryPickerDropdownSelect';

import 'react-phone-number-input/style.css';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
};

export const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;
  display: flex;
  filter: ${(props) => (props.isUnfolded ? 'brightness(0.95)' : 'none')};

  height: 32px;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};

  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;

  &:hover {
    filter: brightness(0.95);
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
  }
`;

export type Country = {
  countryCode: string;
  countryName: string;
  callingCode: CountryCallingCode;
  Flag: Flags.FlagComponent;
};

export const CountryPickerDropdownButton = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (countryCode: string) => void;
}) => {
  const theme = useTheme();

  const [selectedCountry, setSelectedCountry] = useState<Country>();

  const { isDropdownOpen, closeDropdown } = useDropdown({
    dropdownId: 'country-picker',
  });

  const handleChange = (countryCode: string) => {
    onChange(countryCode);
    closeDropdown();
  };

  const countries = useMemo<Country[]>(() => {
    const regionNamesInEnglish = new Intl.DisplayNames(['en'], {
      type: 'region',
    });

    const countryCodes = getCountries();

    return countryCodes.reduce<Country[]>((result, countryCode) => {
      const countryName = regionNamesInEnglish.of(countryCode);

      if (!countryName) return result;

      if (!hasFlag(countryCode)) return result;

      const Flag = Flags[countryCode];

      const callingCode = getCountryCallingCode(countryCode);

      result.push({
        countryCode,
        countryName,
        callingCode,
        Flag,
      });

      return result;
    }, []);
  }, []);

  useEffect(() => {
    const country = countries.find(({ countryCode }) => countryCode === value);
    if (country) {
      setSelectedCountry(country);
    }
  }, [countries, value]);

  return (
    <DropdownMenu
      dropdownId="country-picker"
      dropdownHotkeyScope={{ scope: CountryPickerHotkeyScope.CountryPicker }}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isDropdownOpen}>
          <StyledIconContainer>
            {selectedCountry ? <selectedCountry.Flag /> : <IconWorld />}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledIconContainer>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <CountryPickerDropdownSelect
          countries={countries}
          selectedCountry={selectedCountry}
          onChange={handleChange}
        />
      }
      dropdownOffset={{ x: -60, y: -34 }}
    />
  );
};
