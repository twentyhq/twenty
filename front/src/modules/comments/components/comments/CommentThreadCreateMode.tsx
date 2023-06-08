import { useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { commentableEntityArrayState } from '@/comments/states/commentableEntityArrayState';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import {
  useCreateCommentMutation,
  useCreateCommentThreadWithCommentMutation,
  useGetCommentThreadQuery,
} from '~/generated/graphql';

import { CommentThreadItem } from './CommentThreadItem';

const StyledContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;

  max-height: calc(100% - 16px);

  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(2)};
`;

const StyledThreadItemListContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;

  align-items: flex-start;
  justify-content: flex-start;

  overflow: auto;
  width: 100%;

  gap: ${(props) => props.theme.spacing(4)};
`;

export function CommentThreadCreateMode() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const [createdCommmentThreadId, setCreatedCommentThreadId] = useState<
    string | null
  >(null);

  const [createCommentMutation] = useCreateCommentMutation();

  const [createCommentThreadWithComment] =
    useCreateCommentThreadWithCommentMutation();

  const { data } = useGetCommentThreadQuery({
    variables: {
      commentThreadId: createdCommmentThreadId ?? '',
    },
    skip: !createdCommmentThreadId,
  });

  const comments = data?.findManyCommentThreads[0]?.comments;

  const currentUser = useRecoilValue(currentUserState);

  function handleNewComment(commentText: string) {
    if (!isNonEmptyString(commentText)) {
      return;
    }

    if (!isDefined(currentUser)) {
      logError(
        'In handleCreateCommentThread, currentUser is not defined, this should not happen.',
      );
      return;
    }

    if (!createdCommmentThreadId) {
      createCommentThreadWithComment({
        variables: {
          authorId: currentUser.id,
          commentId: v4(),
          commentText: commentText,
          commentThreadId: v4(),
          createdAt: new Date().toISOString(),
          commentThreadTargetArray: commentableEntityArray.map(
            (commentableEntity) => ({
              commentableId: commentableEntity.id,
              commentableType: commentableEntity.type,
              id: v4(),
              createdAt: new Date().toISOString(),
            }),
          ),
        },
        refetchQueries: ['GetCommentThread'],
        onCompleted(data) {
          setCreatedCommentThreadId(data.createOneCommentThread.id);
        },
      });
    } else {
      createCommentMutation({
        variables: {
          commentId: v4(),
          authorId: currentUser.id,
          commentThreadId: createdCommmentThreadId,
          commentText,
          createdAt: new Date().toISOString(),
        },
        // TODO: find a way to have this configuration dynamic and typed
        refetchQueries: [
          'GetCommentThread',
          'GetPeopleCommentsCount',
          'GetCompanyCommentsCount',
        ],
        onError: (error) => {
          logError(
            `In handleCreateCommentThread, createCommentMutation onError, error: ${error}`,
          );
        },
      });
    }
  }

  return (
    <StyledContainer>
      <StyledThreadItemListContainer>
        {comments?.map((comment) => (
          <CommentThreadItem key={comment.id} comment={comment} />
        ))}
      </StyledThreadItemListContainer>
      <AutosizeTextInput minRows={5} onValidate={handleNewComment} />
    </StyledContainer>
  );
}
