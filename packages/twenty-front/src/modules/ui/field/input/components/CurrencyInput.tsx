import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IMaskInput, IMaskInputProps } from 'react-imask';
import { IconComponent, TEXT_INPUT_STYLE } from 'twenty-ui';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { SETTINGS_FIELD_CURRENCY_CODES } from '@/settings/data-model/constants/SettingsFieldCurrencyCodes';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';

type StyledInputProps = React.ComponentProps<'input'> &
  IMaskInputProps<HTMLInputElement>;

export const StyledIMaskInput = styled(IMaskInput)<StyledInputProps>`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing(0)} ${theme.spacing(1.5)}`};
`;

const StyledContainer = styled.div`
  align-items: center;

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

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (value: string) => {
    setInternalText(value);
    onChange?.(value);
  };

  const handleCurrencyChange = (currency: Currency) => {
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

  const currency = currencies.find(({ value }) => value === currencyCode);

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const Icon: IconComponent = currency?.Icon;

  return (
    <StyledContainer ref={wrapperRef}>
      <CurrencyPickerDropdownButton
        valueCode={currency?.value ?? ''}
        onChange={handleCurrencyChange}
        currencies={currencies}
      />
      <StyledIcon>
        {Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
      </StyledIcon>
      <StyledIMaskInput
        mask={Number}
        thousandsSeparator={','}
        radix="."
        onAccept={(value: string) => handleChange(value)}
        inputRef={wrapperRef}
        autoComplete="off"
        placeholder={placeholder}
        autoFocus={autoFocus}
        value={value}
        unmask
      />
    </StyledContainer>
  );
};
