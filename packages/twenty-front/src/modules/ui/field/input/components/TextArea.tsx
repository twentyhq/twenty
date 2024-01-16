import { ChangeEvent, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '@/object-record/field/meta-types/input/hooks/useRegisterInputEvents';

type TextAreaProps = {
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  hotkeyScope: string;
  onChange?: (newText: string) => void;
};

const StyledTextArea = styled(TextareaAutosize)`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 16px;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: none;
  width: 100%;
  min-height: 32px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    font-family: ${({ theme }) => theme.font.family};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export const TextArea = ({
  disabled,
  className,
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
}: TextAreaProps) => {
  const [internalText, setInternalText] = useState(value);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };

  const wrapperRef = useRef<HTMLTextAreaElement>(null);

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
    <StyledTextArea
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      ref={wrapperRef}
      onChange={handleChange}
      autoFocus={autoFocus}
      value={internalText}
    />
  );
};
