import { useCountries } from '@/ui/input/components/internal/hooks/useCountries';
import { type Country } from '@/ui/input/components/internal/types/Country';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { styled } from '@linaria/react';
import { useContext, useEffect, useState } from 'react';

import { PhoneCountryPickerDropdownSelect } from './PhoneCountryPickerDropdownSelect';

import { PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID } from '@/ui/input/components/internal/phone/constants/PhoneCountryCodePickerDropdownId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import 'react-phone-number-input/style.css';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconWorld } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type StyledDropdownButtonProps = {
  isUnfolded: boolean;
};

const StyledDropdownButtonContainer = styled.div<StyledDropdownButtonProps>`
  align-items: center;
  background: none;
  border-radius: ${themeCssVariables.border.radius.xs} 0 0
    ${themeCssVariables.border.radius.xs};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;

  display: flex;

  height: 32px;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[1]};

  user-select: none;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
  justify-content: center;

  svg {
    align-items: center;
    display: flex;
    height: 12px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledCheveronIconContainer = styled.div`
  svg {
    align-items: center;
    display: flex;
    height: 14px;
    justify-content: center;
    width: 14px;
  }
`;

export const PhoneCountryPickerDropdownButton = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (countryCode: string) => void;
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>();

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID,
  );

  const { closeDropdown } = useCloseDropdown();

  const handleChange = (countryCode: string) => {
    closeDropdown(PHONE_COUNTRY_CODE_PICKER_DROPDOWN_ID);
    onChange(countryCode);
  };

  const countries = useCountries();
  const { theme } = useContext(ThemeContext);

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
