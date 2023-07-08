import { ChangeEvent, useRef, useState } from 'react';

import { InplaceInputPhoneDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputPhoneDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';

import { EditableCell } from '../EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  changeHandler: (updated: string) => void;
};

export function EditableCellPhone({
  value,
  placeholder,
  changeHandler,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

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
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={<InplaceInputPhoneDisplayMode value={inputValue} />}
    />
  );
}
