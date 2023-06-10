import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import { textInputStyle } from '@/ui/layout/styles/themes';

import Link from '../../link/Link';
import { EditableCell } from '../EditableCell';

type OwnProps = {
  placeholder?: string;
  value: string;
  changeHandler: (updated: string) => void;
};

type StyledEditModeProps = {
  isEditMode: boolean;
};

// TODO: refactor
const StyledEditInplaceInput = styled.input<StyledEditModeProps>`
  width: 100%;
  margin: 0px ${(props) => props.theme.spacing(2)};
  ${textInputStyle}
`;

export function EditablePhone({ value, placeholder, changeHandler }: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCell
      isEditMode={isEditMode}
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      tabIndex={0}
      editModeContent={
        <StyledEditInplaceInput
          autoFocus
          isEditMode={isEditMode}
          placeholder={placeholder || ''}
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <div>
          {isValidPhoneNumber(inputValue) ? (
            <Link
              href={parsePhoneNumber(inputValue, 'FR')?.getURI()}
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.stopPropagation();
              }}
            >
              {parsePhoneNumber(inputValue, 'FR')?.formatInternational() ||
                inputValue}
            </Link>
          ) : (
            <Link href="#">{inputValue}</Link>
          )}
        </div>
      }
    />
  );
}
