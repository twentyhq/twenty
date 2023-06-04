import { ChangeEvent, ComponentType, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { CellCommentChip } from '@/comments/components/comments/CellCommentChip';

import { textInputStyle } from '../../layout/styles/themes';

import { EditableCell } from './EditableCell';

export type EditableChipProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{ name: string; picture: string }>;
  commentCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  width: 100%;
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-right: ${(props) => props.theme.spacing(1)};

  ${textInputStyle}
`;

const StyledInplaceShow = styled.div`
  display: flex;
  width: 100%;

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
  commentCount,
  onCommentClick,
}: EditableChipProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  const showComment = commentCount ? commentCount > 0 : false;

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    onCommentClick?.(event);
  }

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
          {showComment && (
            <CellCommentChip
              count={commentCount ?? 0}
              onClick={handleCommentClick}
            />
          )}
        </>
      }
    ></EditableCell>
  );
}

export default EditableChip;
