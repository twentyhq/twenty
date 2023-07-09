import { BlockNoteEditor } from '@blocknote/core';
import styled from '@emotion/styled';

import { BlockEditor } from '@/ui/components/editor/BlockEditor';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';

import { CommentableEntity } from '../types/CommentableEntity';

import { CommentThreadRelationPicker } from './CommentThreadRelationPicker';
import { CommentThreadTypeDropdown } from './CommentThreadTypeDropdown';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
`;

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

const StyledTopContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 24px 24px 48px;
`;

const StyledEditableTitleInput = styled.input`
  background: transparent;

  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1 0 0;

  flex-direction: column;
  font-family: Inter;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: center;

  line-height: ${({ theme }) => theme.text.lineHeight.md};
  outline: none;
  width: 318px;

  :placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export function CommentThreadCreateMode({
  commentableEntityArray,
  editor,
  title,
  handleTitleChange,
}: {
  commentableEntityArray: CommentableEntity[];
  editor: BlockNoteEditor | null;
  title: string;
  handleTitleChange: (newTitle: string) => void;
}) {
  return (
    <StyledContainer>
      <StyledTopContainer>
        <CommentThreadTypeDropdown />
        <StyledEditableTitleInput
          placeholder="Note title (optional)"
          value={title}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleTitleChange(event.target.value)
          }
        />
        <PropertyBox>
          <PropertyBoxItem
            icon={<IconArrowUpRight />}
            value={
              <CommentThreadRelationPicker
                preselected={commentableEntityArray}
              />
            }
            label="Relations"
          />
        </PropertyBox>
      </StyledTopContainer>
      <BlockNoteStyledContainer>
        <BlockEditor editor={editor} />
      </BlockNoteStyledContainer>
    </StyledContainer>
  );
}
