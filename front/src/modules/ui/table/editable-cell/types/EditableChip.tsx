import { ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { InplaceInputTextCellEditMode } from '../../../inplace-input/components/InplaceInputTextCellEditMode';
import { EditableCell } from '../components/EditableCell';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: React.ReactNode;
  activityCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
  onSubmit?: (newValue: string) => void;
  onCancel?: () => void;
};

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
  editModeHorizontalAlign,
  ChipComponent,
  rightEndContents,
  onSubmit,
}: EditableChipProps) {
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
        <InplaceInputTextCellEditMode
          placeholder={placeholder || ''}
          autoFocus
          value={inputValue}
          onSubmit={(newValue) => onSubmit?.(newValue)}
        />
      }
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
