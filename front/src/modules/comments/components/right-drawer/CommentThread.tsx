import React, { useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { GET_COMMENT_THREADS_BY_TARGETS } from '@/comments/services';
import { PropertyBox } from '@/ui/components/property-box/PropertyBox';
import { PropertyBoxItem } from '@/ui/components/property-box/PropertyBoxItem';
import { IconArrowUpRight } from '@/ui/icons/index';
import { debounce } from '@/utils/debounce';
import {
  useGetCommentThreadQuery,
  useUpdateCommentThreadTitleMutation,
} from '~/generated/graphql';

import { CommentThreadBodyEditor } from '../comment-thread/CommentThreadBodyEditor';
import { CommentThreadComments } from '../comment-thread/CommentThreadComments';
import { CommentThreadRelationPicker } from '../comment-thread/CommentThreadRelationPicker';
import { CommentThreadTypeDropdown } from '../comment-thread/CommentThreadTypeDropdown';

import { CommentThreadActionBar } from './CommentThreadActionBar';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow-y: auto;
`;

const StyledUpperPartContainer = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
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
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
  ::placeholder {
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
  const commentThread = data?.findManyCommentThreads[0];

  const [title, setTitle] = useState<string | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [updateCommentThreadTitleMutation] =
    useUpdateCommentThreadTitleMutation();

  const debounceUpdateTitle = useMemo(() => {
    function updateTitle(title: string) {
      updateCommentThreadTitleMutation({
        variables: {
          commentThreadId: commentThreadId,
          commentThreadTitle: title ?? '',
        },
        refetchQueries: [
          getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        ],
      });
    }
    return debounce(updateTitle, 200);
  }, [commentThreadId, updateCommentThreadTitleMutation]);

  function updateTitleFromBody(body: string) {
    const title = JSON.parse(body)[0]?.content[0]?.text;
    if (!commentThread?.title || commentThread?.title === '') {
      setTitle(title);
      debounceUpdateTitle(title);
    }
  }

  useEffect(() => {
    if (commentThread) {
      setIsLoading(false);
    }
    if (isLoading) {
      setTitle(commentThread?.title ?? '');
    }
  }, [commentThread, isLoading]);

  if (!commentThread) {
    return <></>;
  }

  return (
    <StyledContainer>
      <StyledUpperPartContainer>
        <StyledTopContainer>
          <StyledTopActionsContainer>
            <CommentThreadTypeDropdown />
            <CommentThreadActionBar commentThreadId={commentThread?.id ?? ''} />
          </StyledTopActionsContainer>
          <StyledEditableTitleInput
            placeholder="Note title (optional)"
            onChange={(event) => {
              setTitle(event.target.value);
              debounceUpdateTitle(event.target.value);
            }}
            value={title ?? ''}
          />
          <PropertyBox>
            <PropertyBoxItem
              icon={<IconArrowUpRight />}
              value={
                <CommentThreadRelationPicker
                  commentThread={{
                    id: commentThread.id,
                    commentThreadTargets:
                      commentThread.commentThreadTargets ?? [],
                  }}
                />
              }
              label="Relations"
            />
          </PropertyBox>
        </StyledTopContainer>
        <CommentThreadBodyEditor
          commentThread={commentThread}
          onChange={updateTitleFromBody}
        />
      </StyledUpperPartContainer>

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
