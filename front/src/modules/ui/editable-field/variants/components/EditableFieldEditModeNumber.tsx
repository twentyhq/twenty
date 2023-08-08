import { useState } from 'react';

import { TextInputEdit } from '@/ui/input/text/components/TextInputEdit';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

type OwnProps = {
  value: string;
  onChange?: (newValue: number | null) => void;
  parentHotkeyScope?: HotkeyScope;
};

export function EditableFieldEditModeNumber({ value, onChange }: OwnProps) {
  const [internalValue, setInternalValue] = useState(value);

  function handleChange(newValue: string) {
    setInternalValue(newValue);

    if (!canBeCastAsIntegerOrNull(newValue)) {
      return;
    }

    onChange?.(castAsIntegerOrNull(newValue));
  }

  return (
    <TextInputEdit
      autoFocus
      value={internalValue ? internalValue.toString() : ''}
      onChange={(newValue: string) => {
        handleChange(newValue);
      }}
    />
  );
}
