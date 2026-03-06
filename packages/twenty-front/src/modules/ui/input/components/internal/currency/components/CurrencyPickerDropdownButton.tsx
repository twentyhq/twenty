import { styled } from '@linaria/react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { CurrencyCode } from 'twenty-shared/constants';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/display';
import { CurrencyPickerDropdownSelect } from './CurrencyPickerDropdownSelect';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledDropdownButtonContainer = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;
  display: flex;
  height: 32px;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  user-select: none;
  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
  }
`;

export const CurrencyPickerDropdownButton = ({
  selectedCurrencyCode,
  onChange,
}: {
  selectedCurrencyCode: string;
  onChange: (currency: Currency) => void;
}) => {
  const { theme } = useContext(ThemeContext);
  const dropdownId = 'currency-picker-dropdown-id';

  const { closeDropdown } = useCloseDropdown();

  const handleChange = (currency: Currency) => {
    onChange(currency);
    closeDropdown(dropdownId);
  };

  const currency = CURRENCIES.find(
    ({ value }) => value === selectedCurrencyCode,
  );

  const currencyCode = currency?.value ?? CurrencyCode.USD;

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <StyledDropdownButtonContainer>
          <StyledIconContainer>
            {currencyCode}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledIconContainer>
        </StyledDropdownButtonContainer>
      }
      dropdownComponents={
        <CurrencyPickerDropdownSelect
          selectedCurrency={currency}
          onChange={handleChange}
        />
      }
      dropdownPlacement="bottom-start"
      dropdownOffset={{ x: 0, y: 4 }}
    />
  );
};
