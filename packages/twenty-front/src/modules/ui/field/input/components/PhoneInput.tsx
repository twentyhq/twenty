import { useEffect, useRef, useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';

import 'react-phone-number-input/style.css';

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

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

  & svg {
    border-radius: ${({ theme }) => theme.border.radius.xs};
    height: 12px;
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
  onChange?: (newText: string) => void;
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
  onChange,
}: PhoneInputProps) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);
  };

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
        onChange={handleChange}
        international={true}
        withCountryCallingCode={true}
        countrySelectComponent={PhoneCountryPickerDropdownButton}
      />
    </StyledContainer>
  );
};
