import React, { useState } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import { useGetCommentThreadQuery } from '~/generated/graphql';

import { CommentableEntity } from '../types/CommentableEntity';
import { CommentThreadForDrawer } from '../types/CommentThreadForDrawer';

import { Comments } from './Comments';
import { CommentThreadRelationPicker } from './CommentThreadRelationPicker';
import { CommentThreadTypeDropdown } from './CommentThreadTypeDropdown';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;

  padding: ${({ theme }) => theme.spacing(2)};
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
  padding: 24px;
`;

const StyledEditableTitleInput = styled.input`
  background: transparent;

  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1 0 0;

  flex-direction: column;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  justify-content: center;

  line-height: 120%;
  outline: none;
  width: 318px;

  :placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export function CommentThreadEditMode({
  commentThreadId,
}: {
  commentThreadId: string;
}) {
  const { data } = useGetCommentThreadQuery({
    variables: {
      commentThreadId: commentThreadId ?? '',
    },
    skip: !commentThreadId,
  });

  const [editorReady, setEditorReady] = useState(false);

  console.log();

  const editor: BlockNoteEditor | null = useBlockNote({
    theme: useTheme().name === 'light' ? 'light' : 'dark',
    initialContent: undefined,
    onEditorContentChange: (editor) => {
      // Todo: save operation here
      console.log('save');
    },
    onEditorReady: (editor) => {
      setEditorReady(true);
    },
  });

  React.useEffect(() => {
    if (editorReady && data?.findManyCommentThreads[0]?.body) {
      const newContent = JSON.parse(data.findManyCommentThreads[0].body);
      editor?.replaceBlocks(editor.topLevelBlocks, newContent);
    }
  }, [data, editor, editorReady]);

  if (typeof data?.findManyCommentThreads[0] === 'undefined') {
    return null;
  }

  const commentThread = data?.findManyCommentThreads[0];

  // TODO : prevent editor from creating loops

  return (
    <StyledContainer>
      <StyledTopContainer>
        <CommentThreadTypeDropdown />
        <StyledEditableTitleInput
          placeholder="Note title (optional)"
          defaultValue={commentThread.title ?? ''}
        />
        <PropertyBox>
          <PropertyBoxItem
            icon={<IconArrowUpRight />}
            value={
              <CommentThreadRelationPicker commentThread={commentThread} />
            }
            label="Relations"
          />
        </PropertyBox>
      </StyledTopContainer>
      <BlockNoteStyledContainer>
        <BlockNoteView editor={editor} />
      </BlockNoteStyledContainer>
      <Comments commentThread={commentThread} />
    </StyledContainer>
  );
}
