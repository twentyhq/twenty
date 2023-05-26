import styled from '@emotion/styled';
import { ChangeEvent, ComponentType, useRef, useState } from 'react';
import { EditableCell } from './EditableCell';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{ name: string; picture: string }>;
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};

  &::placeholder {
    font-weight: 'bold';
    color: props.theme.text20;
  }
`;

const StyledInplaceShow = styled.div`
  width: 100%;
  border: none;
  outline: none;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};

  &::placeholder {
    font-weight: 'bold';
    color: props.theme.text20;
  }
`;

function EditableChip({
  value,
  placeholder,
  changeHandler,
  picture,
  editModeHorizontalAlign,
  ChipComponent,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCell
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      isEditMode={isEditMode}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledInplaceInput
          placeholder={placeholder || ''}
          autoFocus
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <StyledInplaceShow>
          <ChipComponent name={inputValue} picture={picture} />
        </StyledInplaceShow>
      }
    ></EditableCell>
  );
}

export default EditableChip;
