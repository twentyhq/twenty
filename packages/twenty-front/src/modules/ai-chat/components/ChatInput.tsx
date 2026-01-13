import { useCallback, useState } from 'react';

import styled from '@emotion/styled';
import { IconPaperclip, IconSend } from 'twenty-ui/display';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  background-color: ${({ theme }) => theme.background.primary};
`;

const TextInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  font-size: 1rem;
  font-family: ${({ theme }) => theme.font.family};
  outline: none;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.background.secondary};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const IconButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ disabled, theme }) =>
    disabled ? theme.background.secondary : theme.color.blue};
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.light : theme.grayScale.gray0};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.blue50};
  }
`;

type ChatInputProps = {
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export const ChatInput = ({
  onSend,
  onAttach,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) => {
  const [value, setValue] = useState('');

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <InputContainer>
      {onAttach && (
        <IconButton onClick={onAttach} disabled={disabled}>
          <IconPaperclip size={20} />
        </IconButton>
      )}
      <TextInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <IconButton onClick={handleSend} disabled={disabled || !value.trim()}>
        <IconSend size={20} />
      </IconButton>
    </InputContainer>
  );
};
