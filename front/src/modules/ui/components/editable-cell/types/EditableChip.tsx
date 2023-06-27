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
  ChipComponent: ComponentType<{
    name: string;
    picture: string;
    isOverlapped?: boolean;
  }>;
  commentCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  width: 100%;

  ${textInputStyle}
`;

const NoEditModeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const RightContainer = styled.div`
  margin-left: ${(props) => props.theme.spacing(1)};
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
        <NoEditModeContainer>
          <ChipComponent name={inputValue} picture={picture} />
          <RightContainer>
            {rightEndContents &&
              rightEndContents.length > 0 &&
              rightEndContents.map((content, index) => (
                <div key={index} onClick={handleRightEndContentClick}>
                  {content}
                </div>
              ))}
          </RightContainer>
        </NoEditModeContainer>
      }
    />
  );
}

export default EditableChip;
