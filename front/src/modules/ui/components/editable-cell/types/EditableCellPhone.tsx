import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import { InplaceInputPhoneDisplayMode } from '@/ui/inplace-inputs/components/InplaceInputPhoneDisplayMode';
import { InplaceInputTextEditMode } from '@/ui/inplace-inputs/components/InplaceInputTextEditMode';
import { textInputStyle } from '@/ui/themes/effects';

import { RawLink } from '../../links/RawLink';
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
