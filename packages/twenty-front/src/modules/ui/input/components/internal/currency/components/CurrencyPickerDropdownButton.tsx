import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { CurrencyPickerHotkeyScope } from '../types/CurrencyPickerHotkeyScope';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { Currency } from '@/ui/input/components/internal/types/Currency';
import { IconChevronDown } from 'twenty-ui/display';
import { CurrencyPickerDropdownSelect } from './CurrencyPickerDropdownSelect';

const StyledDropdownButtonContainer = styled.div`
  align-items: center;
  color: ${({ color }) => color ?? 'none'};
  cursor: pointer;
  display: flex;
  border-right: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  height: 32px;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
  const theme = useTheme();

  const { closeDropdown } = useDropdown(
    CurrencyPickerHotkeyScope.CurrencyPicker,
  );

  const handleChange = (currency: Currency) => {
    onChange(currency);
    closeDropdown();
  };

  const currency = CURRENCIES.find(
    ({ value }) => value === selectedCurrencyCode,
  );

  const currencyCode = currency?.value ?? CurrencyCode.USD;

  return (
    <Dropdown
      dropdownId="currency-picker-dropdown-id"
      dropdownHotkeyScope={{ scope: CurrencyPickerHotkeyScope.CurrencyPicker }}
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
