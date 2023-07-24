import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { EditableCell } from '../components/EditableCell';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: React.ReactNode;
  activityCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
  onSubmit?: () => void;
  onCancel?: () => void;
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

// TODO: move right end content in EditableCell
export function EditableCellChip({
  value,
  placeholder,
  changeHandler,
  editModeHorizontalAlign,
  ChipComponent,
  rightEndContents,
  onSubmit,
  onCancel,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleRightEndContentClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <EditableCell
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
      onSubmit={onSubmit}
      onCancel={onCancel}
      nonEditModeContent={
        <NoEditModeContainer>
          {ChipComponent}
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
