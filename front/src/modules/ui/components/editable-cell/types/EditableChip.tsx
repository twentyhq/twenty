import { ChangeEvent, ComponentType, ReactNode, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { EditableCell } from '../EditableCell';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{ name: string; picture: string }>;
  commentCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  width: 100%;

  ${textInputStyle}
`;

const StyledInplaceShow = styled.div`
  display: flex;
  width: 100%;
`;

function EditableChip({
  value,
  placeholder,
  changeHandler,
  picture,
  editModeHorizontalAlign,
  ChipComponent,
  rightEndContents,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleRightEndContentClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

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
        <>
          <StyledInplaceShow>
            <ChipComponent name={inputValue} picture={picture} />
          </StyledInplaceShow>
          {rightEndContents &&
            rightEndContents.length > 0 &&
            rightEndContents.map((content, index) => (
              <div key={index} onClick={handleRightEndContentClick}>
                {content}
              </div>
            ))}
        </>
      }
    ></EditableCell>
  );
}

export default EditableChip;
