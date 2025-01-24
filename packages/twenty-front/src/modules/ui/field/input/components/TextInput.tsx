import styled from '@emotion/styled';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { TEXT_INPUT_STYLE } from 'twenty-ui';

import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';

export const StyledTextInput = styled.input`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

type TextInputProps = {
  inputId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter?: (newText: string) => void;
  onEscape?: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside?: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  hotkeyScope: string;
  onChange?: (newText: string) => void;
  copyButton?: boolean;
  shouldTrim?: boolean;
  disabled?: boolean;
};

const getValue = (value: string, shouldTrim: boolean) => {
  if (shouldTrim) {
    return value.trim();
  }

  return value;
};

export const TextInput = ({
  inputId,
  placeholder,
  autoFocus,
  value,
  hotkeyScope,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
  copyButton = true,
  shouldTrim = true,
  disabled,
}: TextInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef<HTMLInputElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(getValue(event.target.value, shouldTrim));
    onChange?.(getValue(event.target.value, shouldTrim));
  };
  useEffect(() => {
    setInternalText(getValue(value, shouldTrim));
  }, [value, shouldTrim]);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    copyRef: copyRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  return (
    <>
      <StyledTextInput
        id={inputId}
        autoComplete="off"
        ref={wrapperRef}
        placeholder={placeholder}
        onChange={handleChange}
        autoFocus={autoFocus}
        value={internalText}
        disabled={disabled}
      />
      {copyButton && (
        <div ref={copyRef}>
          <LightCopyIconButton copyText={internalText} />
        </div>
      )}
    </>
  );
};
