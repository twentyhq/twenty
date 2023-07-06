import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { commentableEntityArrayState } from '@/comments/states/commentableEntityArrayState';
import { createdCommentThreadIdState } from '@/comments/states/createdCommentThreadIdState';
import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { useOpenRightDrawer } from '@/ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import {
  useCreateCommentMutation,
  useCreateCommentThreadWithCommentMutation,
  useGetCommentThreadQuery,
} from '~/generated/graphql';

import { GET_COMMENT_THREAD } from '../services';

import { CommentThreadItem } from './CommentThreadItem';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;

  max-height: calc(100% - 16px);
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledThreadItemListContainer = styled.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
  overflow: auto;

  width: 100%;
`;

export function CommentThreadCreateMode() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const [createdCommmentThreadId, setCreatedCommentThreadId] = useRecoilState(
    createdCommentThreadIdState,
  );

  const openRightDrawer = useOpenRightDrawer();

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

  const displayCommentList = (comments?.length ?? 0) > 0;

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
        refetchQueries: [
          getOperationName(GET_COMPANIES) ?? '',
          getOperationName(GET_PEOPLE) ?? '',
          getOperationName(GET_COMMENT_THREAD) ?? '',
        ],
        onCompleted(data) {
          setCreatedCommentThreadId(data.createOneCommentThread.id);
          openRightDrawer('comments');
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
        refetchQueries: [getOperationName(GET_COMMENT_THREAD) ?? ''],
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
      {displayCommentList && (
        <StyledThreadItemListContainer>
          {comments?.map((comment) => (
            <CommentThreadItem key={comment.id} comment={comment} />
          ))}
        </StyledThreadItemListContainer>
      )}
      <AutosizeTextInput minRows={5} onValidate={handleNewComment} />
    </StyledContainer>
  );
}
