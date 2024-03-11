import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { TEXT_INPUT_STYLE } from '@/ui/theme/constants/TextInputStyle';
import { isDefined } from '~/utils/isDefined';

export const StyledInput = styled.input`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing(0)} ${theme.spacing(1)}`};
`;

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  display: flex;
  justify-content: center;
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;

  & > svg {
    padding-left: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.font.color.tertiary};
    height: ${({ theme }) => theme.icon.size.md}px;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

export type CurrencyInputProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  currencyCode: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  onChange?: (newText: string) => void;
  onSelect?: (newText: string) => void;
  hotkeyScope: string;
};

type Currency = {
  label: string;
  value: string;
  Icon: any;
};

export const CurrencyInput = ({
  autoFocus,
  value,
  currencyCode,
  placeholder,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
  onSelect,
  hotkeyScope,
}: CurrencyInputProps) => {
  const theme = useTheme();

  const [internalText, setInternalText] = useState(value);
  const [internalCurrency, setInternalCurrency] = useState<Currency | null>(
    null,
  );

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setInternalCurrency(currency);
    onSelect?.(currency.value);
  };

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  const currencies = useMemo<Currency[]>(
    () =>
      Object.entries(SETTINGS_FIELD_CURRENCY_CODES).map(
        ([key, { Icon, label }]) => ({
          value: key,
          Icon,
          label,
        }),
      ),
    [],
  );

  useEffect(() => {
    const currency = currencies.find(({ value }) => value === currencyCode);
    if (isDefined(currency)) {
      setInternalCurrency(currency);
    }
  }, [currencies, currencyCode]);

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const Icon: IconComponent = internalCurrency?.Icon;

  return (
    <StyledContainer ref={wrapperRef}>
      <CurrencyPickerDropdownButton
        valueCode={internalCurrency?.value ?? ''}
        onChange={handleCurrencyChange}
        currencies={currencies}
      />
      <StyledIcon>
        {Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
      </StyledIcon>
      <StyledInput
        autoComplete="off"
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        value={value}
      />
    </StyledContainer>
  );
};
