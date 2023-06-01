import styled from '@emotion/styled';
import { ChangeEvent, useRef, useState } from 'react';
import { EditableCell } from './EditableCell';
import { textInputStyle } from '../../layout/styles/themes';

type OwnProps = {
  placeholder?: string;
  content: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

type StyledEditModeProps = {
  isEditMode: boolean;
};

// TODO: refactor
const StyledInplaceInput = styled.input<StyledEditModeProps>`
  width: 100%;
  ${textInputStyle}
`;

const StyledNoEditText = styled.div`
  width: 100%;
`;

function EditableText({
  content,
  placeholder,
  changeHandler,
  editModeHorizontalAlign,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(content);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCell
      isEditMode={isEditMode}
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledInplaceInput
          isEditMode={isEditMode}
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
      nonEditModeContent={<StyledNoEditText>{inputValue}</StyledNoEditText>}
    ></EditableCell>
  );
}

export default EditableText;
