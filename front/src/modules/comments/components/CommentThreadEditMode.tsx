import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import {
  useGetCommentThreadQuery,
  useUpdateCommentThreadBodyMutation,
  useUpdateCommentThreadTitleMutation,
} from '~/generated/graphql';

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

  const [isDataLoaded, setDataLoaded] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [title, setTitle] = useState('');

  const [updateCommentThreadTitleMutation] =
    useUpdateCommentThreadTitleMutation({
      update(cache, { data }) {
        // If successful, write the updated data back to the cache
        if (data) {
          cache.writeFragment({
            id: cache.identify(data.updateOneCommentThread),
            fragment: gql`
              fragment CommentThreadTitle on CommentThread {
                id
                title
              }
            `,
            data: data.updateOneCommentThread,
          });
        }
      },
    });

  const [updateCommentThreadBodyMutation] = useUpdateCommentThreadBodyMutation({
    update(cache, { data }) {
      // If successful, write the updated data back to the cache
      if (data) {
        cache.writeFragment({
          id: cache.identify(data.updateOneCommentThread),
          fragment: gql`
            fragment CommentThreadBody on CommentThread {
              id
              body
            }
          `,
          data: data.updateOneCommentThread,
        });
      }
    },
  });

  const editor: BlockNoteEditor | null = useBlockNote({
    theme: useTheme().name === 'light' ? 'light' : 'dark',
    initialContent: undefined,
    onEditorContentChange: (editor) => {
      updateCommentThreadBodyMutation({
        variables: {
          commentThreadId: commentThreadId,
          commentThreadBody: JSON.stringify(editor.topLevelBlocks) ?? '',
        },
      });
    },
    onEditorReady: (editor) => {
      setEditorReady(true);
    },
  });

  React.useEffect(() => {
    if (editorReady && data?.findManyCommentThreads[0]?.body && !isDataLoaded) {
      const newContent = JSON.parse(data.findManyCommentThreads[0].body);
      editor?.replaceBlocks(editor.topLevelBlocks, newContent);
      setDataLoaded(true);
    }
    if (data?.findManyCommentThreads[0]?.title) {
      setTitle(data.findManyCommentThreads[0].title);
    }
  }, [data, editor, editorReady, isDataLoaded]);

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    updateCommentThreadTitleMutation({
      variables: {
        commentThreadId: commentThreadId,
        commentThreadTitle: e.target.value ?? '',
      },
    });
  }

  if (typeof data?.findManyCommentThreads[0] === 'undefined') {
    return null;
  }

  const commentThread = data?.findManyCommentThreads[0];

  // TODO : check editor performance (loops/ double save)

  return (
    <StyledContainer>
      <StyledTopContainer>
        <CommentThreadTypeDropdown />
        <StyledEditableTitleInput
          placeholder="Note title (optional)"
          onChange={onTitleChange}
          value={title}
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
