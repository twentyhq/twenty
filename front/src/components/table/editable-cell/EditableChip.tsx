import styled from '@emotion/styled';
import { ChangeEvent, ComponentType, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{ name: string; picture: string }>;
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
  editModeHorizontalAlign,
  ChipComponent,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  return (
    <EditableCellWrapper
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
      nonEditModeContent={<ChipComponent name={value} picture={picture} />}
    ></EditableCellWrapper>
  );
}

export default EditableChip;
