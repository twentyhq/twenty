import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

type RecordFormUuidFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormUuidFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormUuidFieldInputProps) => {
  const [inputText, setInputText] = useState(defaultValue ?? '');

  const handleChange = (newText: string) => {
    setInputText(newText);

    const trimmedText = newText.trim();

    onChange(trimmedText === '' ? null : trimmedText);
  };

  return (
    <RecordFormTextInput
      label={label}
      value={inputText}
      onChange={handleChange}
      placeholder={placeholder ?? t`Enter a UUID`}
      readonly={readonly}
    />
  );
};
