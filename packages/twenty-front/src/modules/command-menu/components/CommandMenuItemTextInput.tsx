import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Key } from 'ts-key-enum';

type CommandMenuItemTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const StyledRightAlignedTextInput = styled(TextInput)`
  input {
    :focus {
      color: ${({ theme }) => theme.font.color.primary};
    }
    color: ${({ theme }) => theme.font.color.tertiary};
    text-align: right;
  }
`;

export const CommandMenuItemTextInput = ({
  value,
  onChange,
  placeholder,
}: CommandMenuItemTextInputProps) => {
  const [draftValue, setDraftValue] = useState(value);

  const handleChange = (text: string) => {
    setDraftValue(text);
  };

  const handleCommit = () => {
    onChange(draftValue);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleBlur = () => {
    handleCommit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter || event.key === Key.Escape) {
      event.stopPropagation();
      handleCommit();
    } else {
      event.stopPropagation();
    }
  };

  return (
    <StyledRightAlignedTextInput
      value={draftValue}
      sizeVariant="sm"
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
};
