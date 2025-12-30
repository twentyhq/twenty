import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { IMaskInput } from 'react-imask';
import { type IconComponent } from 'twenty-ui/display';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';

export const StyledIMaskInput = styled(IMaskInput)`
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
  instanceId: string;
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  decimals?: number;
  currencyCode: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  onChange?: (newText: string) => void;
  onSelect?: (newText: string) => void;
};

export const CurrencyInput = ({
  instanceId,
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
  decimals,
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
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
  });

  const currency = CURRENCIES.find(({ value }) => value === currencyCode);

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const Icon: IconComponent = currency?.Icon;

  return (
    <StyledContainer ref={wrapperRef}>
      <CurrencyPickerDropdownButton
        selectedCurrencyCode={currency?.value ?? ''}
        onChange={handleCurrencyChange}
      />
      <StyledIcon>
        {Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
      </StyledIcon>
      <StyledIMaskInput
        mask={Number}
        thousandsSeparator=","
        radix="."
        scale={decimals}
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
