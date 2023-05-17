import styled from '@emotion/styled';
import { ChangeEvent, ComponentType, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  chipClickHandler: (editing: boolean) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{
    name: string;
    picture: string;
    clickHandler: (editing: boolean) => void;
  }>;
};

const StyledInplaceInput = styled.input`
  width: 100%;
  border: none;
  outline: none;

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
  chipClickHandler,
  editModeHorizontalAlign,
  ChipComponent,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCellWrapper
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
        <ChipComponent
          name={inputValue}
          picture={picture}
          clickHandler={chipClickHandler}
        />
      }
    ></EditableCellWrapper>
  );
}

export default EditableChip;
