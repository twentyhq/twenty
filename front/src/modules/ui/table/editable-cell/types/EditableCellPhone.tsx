import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { InplaceInputPhoneDisplayMode } from '@/ui/display/component/InplaceInputPhoneDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';

import { EditableCell } from '../components/EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  onChange: (updated: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function EditableCellPhone({
  value,
  placeholder,
  onChange,
  onSubmit,
  onCancel,
}: OwnProps) {
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
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
