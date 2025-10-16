import { TextInput } from '@/ui/input/components/TextInput';
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
      const isInvalid = onValidate(numericValue);
      if (isInvalid) {
        setHasError(true);
        return;
      }
    }

    onChange(numericValue);
    setHasError(false);
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
    <TextInput
      type="number"
      value={draftValue}
      sizeVariant="sm"
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      error={hasError ? ' ' : undefined}
      noErrorHelper
    />
  );
};
