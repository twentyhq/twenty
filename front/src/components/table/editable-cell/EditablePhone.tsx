import styled from '@emotion/styled';
import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import Link from '../../link/Link';

type OwnProps = {
  placeholder?: string;
  value: string;
  changeHandler: (updated: string) => void;
};

type StyledEditModeProps = {
  isEditMode: boolean;
};

const StyledEditInplaceInput = styled.input<StyledEditModeProps>`
  width: 100%;
  border: none;
  outline: none;

  &::placeholder {
    font-weight: bold;
    color: ${(props) => props.theme.text20};
  }
`;

function EditablePhone({ value, placeholder, changeHandler }: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCellWrapper
      isEditMode={isEditMode}
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
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

export default EditablePhone;
