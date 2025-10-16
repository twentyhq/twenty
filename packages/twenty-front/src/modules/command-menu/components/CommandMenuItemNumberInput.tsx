import { TextInput } from '@/ui/input/components/TextInput';
import { useRef } from 'react';
import { Key } from 'ts-key-enum';
import {
  canBeCastAsNumberOrNull,
  castAsNumberOrNull,
} from '~/utils/cast-as-number-or-null';

type CommandMenuItemNumberInputProps = {
  value: string;
  onChange: (value: number | null) => void;
  placeholder?: string;
};

export const CommandMenuItemNumberInput = ({
  value,
  onChange,
  placeholder,
}: CommandMenuItemNumberInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (text: string) => {
    if (canBeCastAsNumberOrNull(text)) {
      const numericValue = castAsNumberOrNull(text);
      onChange(numericValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === Key.Enter || event.key === Key.Escape) {
      event.stopPropagation();
      inputRef.current?.blur();
    } else {
      event.stopPropagation();
    }
  };

  return (
    <TextInput
      ref={inputRef}
      type="number"
      value={value}
      sizeVariant="sm"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
    />
  );
};
