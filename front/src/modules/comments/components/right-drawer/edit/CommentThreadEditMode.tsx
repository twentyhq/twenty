import React, { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMMENT_THREADS_BY_TARGETS } from '@/comments/services';
import { BlockEditor } from '@/ui/components/editor/BlockEditor';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import {
  useCreateCommentMutation,
  useGetCommentThreadQuery,
  useUpdateCommentThreadBodyMutation,
  useUpdateCommentThreadTitleMutation,
} from '~/generated/graphql';

import { CommentThreadItem } from '../../comment/CommentThreadItem';
import { CommentThreadRelationPicker } from '../../comment-thread/CommentThreadRelationPicker';
import { CommentThreadTypeDropdown } from '../../comment-thread/CommentThreadTypeDropdown';
import { CommentThreadActionBar } from '../CommentThreadActionBar';

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

const StyledTopActionsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const StyledThreadItemListContainer = styled.div`
  align-items: flex-start;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};

  box-sizing: border-box;
  display: flex;

  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: flex-start;
  padding: 16px 24px 16px 48px;
  width: 100%;
`;

const StyledCommentActionBar = styled.div`
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 16px 24px 16px 48px;
  position: absolute;
  width: calc(${({ theme }) => theme.rightDrawerWidth} - 48px - 24px);
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
    useUpdateCommentThreadTitleMutation();

  const [updateCommentThreadBodyMutation] =
    useUpdateCommentThreadBodyMutation();

  const editor: BlockNoteEditor | null = useBlockNote({
    theme: useTheme().name === 'light' ? 'light' : 'dark',
    initialContent: undefined,
    editorDOMAttributes: { class: 'editor-edit-mode' },
    onEditorContentChange: (editor) => {
      updateCommentThreadBodyMutation({
        variables: {
          commentThreadId: commentThreadId,
          commentThreadBody: JSON.stringify(editor.topLevelBlocks) ?? '',
        },
        refetchQueries: [
          getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        ],
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
      refetchQueries: [getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? ''],
    });
  }

  const commentThread = data?.findManyCommentThreads[0];

  // ---- Comments

  const [createCommentMutation] = useCreateCommentMutation();
  const currentUser = useRecoilValue(currentUserState);

  function handleSendComment(commentText: string) {
    if (!isNonEmptyString(commentText)) {
      return;
    }

    if (!isDefined(currentUser)) {
      logError(
        'In handleSendComment, currentUser is not defined, this should not happen.',
      );
      return;
    }

    createCommentMutation({
      variables: {
        commentId: v4(),
        authorId: currentUser.id,
        commentThreadId: commentThread?.id ?? '',
        commentText: commentText,
        createdAt: new Date().toISOString(),
      },
      refetchQueries: [getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? ''],
      onError: (error) => {
        logError(
          `In handleSendComment, createCommentMutation onError, error: ${error}`,
        );
      },
    });
  }

  // TODO : check editor performance (loops/ double save)

  if (typeof data?.findManyCommentThreads[0] === 'undefined') {
    return null;
  }

  return (
    <StyledContainer>
      <StyledTopContainer>
        <StyledTopActionsContainer>
          <CommentThreadTypeDropdown />
          <CommentThreadActionBar commentThreadId={commentThread?.id ?? ''} />
        </StyledTopActionsContainer>
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
        <BlockEditor editor={editor} />
      </BlockNoteStyledContainer>

      <StyledThreadItemListContainer>
        {commentThread?.comments?.map((comment, index) => (
          <CommentThreadItem
            key={comment.id}
            comment={comment}
            //actionBar={}
          />
        ))}
      </StyledThreadItemListContainer>

      <StyledCommentActionBar>
        <AutosizeTextInput onValidate={handleSendComment} />
      </StyledCommentActionBar>
    </StyledContainer>
  );
}
