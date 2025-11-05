import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type CommandMenuItemNumberInputProps = {
  value: string;
  onChange: (value: number | null) => void;
  onValidate?: (value: number | null) => boolean;
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
export const CommandMenuItemNumberInput = ({
  value,
  onChange,
  onValidate,
  placeholder,
}: CommandMenuItemNumberInputProps) => {
  const [draftValue, setDraftValue] = useState(value);
  const [hasError, setHasError] = useState(false);

  const handleChange = (text: string) => {
    setDraftValue(text);
    if (hasError) {
      setHasError(false);
    }
  };

  const handleCommit = () => {
    if (!canBeCastAsNumberOrNull(draftValue)) {
      setHasError(true);
      setDraftValue(value);
      return;
    }

    const numericValue = castAsNumberOrNull(draftValue);

    if (isDefined(onValidate)) {
      const isValid = onValidate(numericValue);
      if (!isValid) {
        setHasError(true);
        return;
      }
    }

    onChange(numericValue);
    setHasError(false);
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
      error={hasError ? ' ' : undefined}
      noErrorHelper
    />
  );
};
