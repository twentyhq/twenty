import styled from '@emotion/styled';
import { ChangeEvent, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

type OwnProps = {
  placeholder?: string;
  content: string;
  changeHandler: (updated: string) => void;
};

type StyledEditModeProps = {
  isEditMode: boolean;
};

const StyledInplaceInput = styled.input<StyledEditModeProps>`
  width: 100%;
  border: none;
  outline: none;

  &::placeholder {
    font-weight: ${(props) => (props.isEditMode ? 'bold' : 'normal')};
    color: ${(props) =>
      props.isEditMode ? props.theme.text20 : 'transparent'};
  }
`;

function EditableCell({ content, placeholder, changeHandler }: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(content);
  const [isEditMode, setIsEditMode] = useState(false);

  const onEditModeChange = (isEditMode: boolean) => {
    setIsEditMode(isEditMode);
    if (isEditMode) {
      inputRef.current?.focus();
    }
  };

  return (
    <EditableCellWrapper onEditModeChange={onEditModeChange}>
      <StyledInplaceInput
        isEditMode={isEditMode}
        placeholder={placeholder || ''}
        ref={inputRef}
        value={inputValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setInputValue(event.target.value);
          changeHandler(event.target.value);
        }}
      />
    </EditableCellWrapper>
  );
}

export default EditableCell;
