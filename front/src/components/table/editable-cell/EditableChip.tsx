import styled from '@emotion/styled';
import { ChangeEvent, ComponentType, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  shouldAlignRight?: boolean;
  ChipComponent: ComponentType<{ name: string; picture: string }>;
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
function EditableChip({
  value,
  placeholder,
  changeHandler,
  picture,
  shouldAlignRight,
  ChipComponent,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  const onEditModeChange = (isEditMode: boolean) => {
    setIsEditMode(isEditMode);
  };

  return (
    <EditableCellWrapper
      onEditModeChange={onEditModeChange}
      shouldAlignRight={shouldAlignRight}
    >
      {isEditMode ? (
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
      ) : (
        <ChipComponent name={value} picture={picture} />
      )}
    </EditableCellWrapper>
  );
}

export default EditableChip;
