import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { styled } from '@linaria/react';

import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { CurrencyCode } from 'twenty-shared/constants';
import { Dropdown } from 'twenty-ui/components';

import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { useContext } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { CurrencyPickerDropdownSelect } from './CurrencyPickerDropdownSelect';
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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  const { theme } = useContext(ThemeContext);
  const dropdownId = 'currency-picker-dropdown-id';

  const currency = CURRENCIES.find(
    ({ value }) => value === selectedCurrencyCode,
  );

  const currencyCode = currency?.value ?? CurrencyCode.USD;

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        <StyledDropdownButtonContainer>
          <StyledIconContainer>
            {currencyCode}
            <IconChevronDown size={theme.icon.size.sm} />
          </StyledIconContainer>
        </StyledDropdownButtonContainer>
      </Dropdown.Trigger>
      <Dropdown.Content
        side="bottom"
        align="start"
        sideOffset={4}
        alignOffset={0}
        data-click-outside-id={excludedClickOutsideId}
      >
        <div data-click-outside-id={parentClickOutsideId}>
          <CurrencyPickerDropdownSelect
            selectedCurrency={currency}
            onChange={onChange}
          />
        </div>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
