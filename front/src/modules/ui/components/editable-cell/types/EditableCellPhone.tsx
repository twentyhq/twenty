import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { InplaceInputPhoneDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputPhoneDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';

import { CellSkeleton } from '../CellSkeleton';
import { EditableCell } from '../EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  onChange: (updated: string) => void;
};

export function EditableCellPhone({ value, placeholder, onChange }: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <EditableCell
      editModeContent={
        <InplaceInputTextEditMode
          autoFocus
          placeholder={placeholder || ''}
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            onChange(event.target.value);
          }}
        />
      }
      nonEditModeContent={<InplaceInputPhoneDisplayMode value={inputValue} />}
    />
  );
}
