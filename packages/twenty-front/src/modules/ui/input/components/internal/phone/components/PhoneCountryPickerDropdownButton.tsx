import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { type Country } from '@/ui/input/components/internal/types/Country';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { PhoneCountryPickerDropdownSelect } from './PhoneCountryPickerDropdownSelect';

import { PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID } from '@/ui/input/components/internal/phone/constants/PhoneCountryCodePickerDropdownId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import 'react-phone-number-input/style.css';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconWorld } from 'twenty-ui/display';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
};

const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: none;
  border-radius: ${({ theme }) => theme.border.radius.xs} 0 0
    ${({ theme }) => theme.border.radius.xs};
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;
  display: flex;

  height: 32px;

  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  user-select: none;

  border-right: 1px solid ${({ theme }) => theme.border.color.medium};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  justify-content: center;

  svg {
    align-items: center;
    display: flex;
    height: 12px;
    width: 16px;
    justify-content: center;
  }
`;

const StyledCheveronIconContainer = styled.div`
  svg {
    align-items: center;
    display: flex;
    height: 14px;
    width: 14px;
    justify-content: center;
  }
`;

export const PhoneCountryPickerDropdownButton = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (countryCode: string) => void;
}) => {
  const theme = useTheme();

  const [selectedCountry, setSelectedCountry] = useState<Country>();

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID,
  );

  const { closeDropdown } = useCloseDropdown();

  const handleChange = (countryCode: string) => {
    closeDropdown(PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID);
    onChange(countryCode);
  };

  const countries = useCountries();

  useEffect(() => {
    const country = countries.find(({ countryCode }) => countryCode === value);
    if (isDefined(country)) {
      setSelectedCountry(country);
    }
  }, [countries, value]);

  return (
    <Dropdown
      dropdownId={PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID}
      clickableComponent={
        <StyledDropdownButtonContainer isUnfolded={isDropdownOpen}>
          <StyledIconContainer>
            {selectedCountry ? <selectedCountry.Flag /> : <IconWorld />}
            <StyledCheveronIconContainer>
              <IconChevronDown size={theme.icon.size.sm} />
            </StyledCheveronIconContainer>
          </StyledIconContainer>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <PhoneCountryPickerDropdownSelect
          countries={countries}
          selectedCountry={selectedCountry}
          onChange={handleChange}
        />
      }
      dropdownPlacement="bottom-start"
      dropdownOffset={{ x: 0, y: 4 }}
    />
  );
};
