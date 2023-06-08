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
} from '~/generated/graphql';

import { CommentThreadItem } from './CommentThreadItem';

const StyledContainer = styled.div`
  display: flex;
  align-items: flex-start;

  flex-direction: column;

  justify-content: flex-start;

  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(2)};
`;

const StyledThreadItemListContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;

  align-items: flex-start;
  justify-content: flex-start;

  max-height: 400px;
  overflow: auto;

  gap: ${(props) => props.theme.spacing(4)};
`;

export function CommentThreadCreateMode() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  const [createCommentThreadWithComment] =
    useCreateCommentThreadWithCommentMutation();

  const currentUser = useRecoilValue(currentUserState);

  function handleCreateCommentThread(commentText: string) {
    if (!isDefined(currentUser)) {
      logError(
        'In handleCreateCommentThread, currentUser is not defined, this should not happen.',
      );
      return;
    }

    if (!isNonEmptyString(commentText)) {
      logError(
        'In handleCreateCommentThread, trying to send empty text, this should not happen.',
      );
      return;
    }

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
      refetchQueries: [''],
    });
  }

  return (
    <StyledContainer>
      <StyledThreadItemListContainer>
        {/* {commentThread.comments?.map((comment) => (
          <CommentThreadItem key={comment.id} comment={comment} />
        ))} */}
      </StyledThreadItemListContainer>
      <AutosizeTextInput minRows={5} onValidate={handleCreateCommentThread} />
    </StyledContainer>
  );
}
