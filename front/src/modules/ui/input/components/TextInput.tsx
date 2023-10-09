import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

import { useRegisterInputEvents } from '../hooks/useRegisterInputEvents';

export const StyledInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

type TextInputProps = {
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

export const TextInput = ({
  placeholder,
  autoFocus,
  value,
  hotkeyScope,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
}: TextInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
  };

  useEffect(() => {
    setInternalText(value);
  }, [value]);

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

  return (
    <StyledInput
      autoComplete="off"
      ref={wrapperRef}
      placeholder={placeholder}
      onChange={handleChange}
      autoFocus={autoFocus}
      value={internalText}
    />
  );
};
