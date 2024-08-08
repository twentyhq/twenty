import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import ReactPhoneNumberInput from 'react-phone-number-input';
import { TEXT_INPUT_STYLE } from 'twenty-ui';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { PhoneCountryPickerDropdownButton } from '@/ui/input/components/internal/phone/components/PhoneCountryPickerDropdownButton';

import { E164Number } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

const StyledContainer = styled.div`
  align-items: center;

  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  width: 100%;

  display: flex;
  justify-content: start;
`;

const StyledCustomPhoneInput = styled(ReactPhoneNumberInput)`
  font-family: ${({ theme }) => theme.font.family};
  height: 32px;
  ${TEXT_INPUT_STYLE}
  padding: 0;

  .PhoneInputInput {
    background: none;
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
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
`;

const StyledLightIconButtonContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;
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
  copyButton?: boolean;
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
  copyButton = true,
}: PhoneInputProps) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(value);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const handleChange = (newValue: E164Number) => {
    setInternalValue(newValue);
    onChange?.(newValue as string);
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    copyRef: copyRef,
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
      {copyButton && (
        <StyledLightIconButtonContainer ref={copyRef}>
          <LightCopyIconButton copyText={value} />
        </StyledLightIconButtonContainer>
      )}
    </StyledContainer>
  );
};
