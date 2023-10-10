import { useEffect, useRef, useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '../hooks/useRegisterInputEvents';

import { CountryPickerDropdownButton } from './CountryPickerDropdownButton';

import 'react-phone-number-input/style.css';

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  display: flex;
  justify-content: center;
`;

const StyledCustomPhoneInput = styled(ReactPhoneNumberInput)`
  font-family: ${({ theme }) => theme.font.family};
  height: 32px;

  .PhoneInputInput {
    background: ${({ theme }) => theme.background.transparent.secondary};
    border: none;
    color: ${({ theme }) => theme.font.color.primary};

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${({ theme }) => theme.font.color.light};
      font-family: ${({ theme }) => theme.font.family};
      font-weight: ${({ theme }) => theme.font.weight.medium};
    }

    :focus {
      outline: none;
    }
  }
`;

export type PhoneInputProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  hotkeyScope: string;
};

export const PhoneInput = ({
  autoFocus,
  value,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  hotkeyScope,
}: PhoneInputProps) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalValue ?? '',
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  return (
    <StyledContainer ref={wrapperRef}>
      <StyledCustomPhoneInput
        autoFocus={autoFocus}
        placeholder="Phone number"
        value={value}
        onChange={setInternalValue}
        international={true}
        withCountryCallingCode={true}
        countrySelectComponent={CountryPickerDropdownButton}
      />
    </StyledContainer>
  );
};
