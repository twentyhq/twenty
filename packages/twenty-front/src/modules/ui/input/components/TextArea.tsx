import { FocusEventHandler } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import styled from '@emotion/styled';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { InputHotkeyScope } from '../types/InputHotkeyScope';

const MAX_ROWS = 5;

export type TextAreaProps = {
  disabled?: boolean;
  minRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
};

const StyledTextArea = styled(TextareaAutosize)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
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
  padding-top: ${({ theme }) => theme.spacing(3)};
  resize: none;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export const TextArea = ({
  disabled,
  placeholder,
  minRows = 1,
  value = '',
  className,
  onChange,
}: TextAreaProps) => {
  const computedMinRows = Math.min(minRows, MAX_ROWS);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    setHotkeyScopeAndMemorizePreviousScope(InputHotkeyScope.TextInput);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <StyledTextArea
      placeholder={placeholder}
      maxRows={MAX_ROWS}
      minRows={computedMinRows}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
    />
  );
};
