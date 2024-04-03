import { useEffect, useRef, useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';
import { TEXT_INPUT_STYLE } from '@/ui/theme/constants/TextInputStyle';

import 'react-phone-number-input/style.css';

const StyledCustomPhoneInput = styled(ReactPhoneNumberInput)`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  font-family: ${({ theme }) => theme.font.family};
  height: 32px;

  .PhoneInputInput {
    background-color: transparent;
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
  width: 75%;
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

  const wrapperRef = useRef<HTMLInputElement>(null);

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
    <StyledCustomPhoneInput
      autoFocus={autoFocus}
      placeholder="Phone number"
      value={value}
      onChange={handleChange}
      international={true}
      withCountryCallingCode={true}
      countrySelectComponent={PhoneCountryPickerDropdownButton}
      ref={wrapperRef}
    />
  );
};
