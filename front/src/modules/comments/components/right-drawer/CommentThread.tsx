import React, { useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { GET_COMMENT_THREADS_BY_TARGETS } from '@/comments/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import {
  useGetCommentThreadQuery,
  useUpdateCommentThreadTitleMutation,
} from '~/generated/graphql';

import { CommentThreadComments } from '../comment-thread/CommentThreadComments';
import { CommentThreadEditor } from '../comment-thread/CommentThreadEditor';
import { CommentThreadRelationPicker } from '../comment-thread/CommentThreadRelationPicker';
import { CommentThreadTypeDropdown } from '../comment-thread/CommentThreadTypeDropdown';

import { CommentThreadActionBar } from './CommentThreadActionBar';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
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

type OwnProps = {
  commentThreadId: string;
  showComment?: boolean;
};

export function CommentThread({
  commentThreadId,
  showComment = true,
}: OwnProps) {
  const { data } = useGetCommentThreadQuery({
    variables: {
      commentThreadId: commentThreadId ?? '',
    },
    skip: !commentThreadId,
  });

  const [title, setTitle] = useState('');

  const [updateCommentThreadTitleMutation] =
    useUpdateCommentThreadTitleMutation();

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

  if (!commentThread) {
    return <></>;
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
      <CommentThreadEditor commentThread={commentThread} />
      {showComment && (
        <CommentThreadComments
          commentThread={{
            id: commentThread.id,
            comments: commentThread.comments ?? [],
          }}
        />
      )}
    </StyledContainer>
  );
}
