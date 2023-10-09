import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

import { useRegisterInputEvents } from '../hooks/useRegisterInputEvents';

export const StyledInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

type OwnProps = {
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
}: OwnProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef(null);
  const isSelectingTextInInput = useRef<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
  };

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  const onClickOutsideNew = (
    event: MouseEvent | TouchEvent,
    inputValue: string,
  ) => {
    if (!isSelectingTextInInput.current) {
      onClickOutside(event, inputValue);
    }
    isSelectingTextInInput.current = false;
  };

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside: onClickOutsideNew,
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
      onMouseDown={() => {
        isSelectingTextInInput.current = true;
      }}
      onMouseUp={() => {
        isSelectingTextInInput.current = false;
      }}
    />
  );
};
