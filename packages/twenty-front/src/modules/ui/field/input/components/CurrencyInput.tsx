import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { useContext, useEffect, useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { CURRENCIES } from '@/settings/data-model/constants/Currencies';
import { CurrencyPickerDropdownButton } from '@/ui/input/components/internal/currency/components/CurrencyPickerDropdownButton';
import { type Currency } from '@/ui/input/components/internal/types/Currency';
import { IMaskInput } from 'react-imask';
import { type IconComponent } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledIMaskInput = styled.div`
  > input {
    background-color: transparent;
    border: none;
    color: ${themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.font.family};
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
    outline: none;
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1.5]};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${themeCssVariables.font.color.light};
      font-family: ${themeCssVariables.font.family};
      font-weight: ${themeCssVariables.font.weight.medium};
    }

    width: 100%;
  }
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
    color: ${themeCssVariables.font.color.tertiary};
    height: ${themeCssVariables.icon.size.md}px;
    padding-left: ${themeCssVariables.spacing[1]};
    width: ${themeCssVariables.icon.size.md}px;
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
  const { theme } = useContext(ThemeContext);
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
        {isDefined(Icon) && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
      </StyledIcon>
      <StyledIMaskInput>
        <IMaskInput
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
      </StyledIMaskInput>
    </StyledContainer>
  );
};
