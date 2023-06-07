import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import { useCreateCommentMutation } from '~/generated/graphql';

import { CommentThreadItem } from './CommentThreadItem';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

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

export function CommentThread({ commentThread }: OwnProps) {
  const [createCommentMutation] = useCreateCommentMutation();
  const currentUser = useRecoilValue(currentUserState);

  function handleSendComment(commentText: string) {
    if (!isDefined(currentUser)) {
      logError(
        'In handleSendComment, currentUser is not defined, this should not happen.',
      );
      return;
    }

    if (!isNonEmptyString(commentText)) {
      logError(
        'In handleSendComment, trying to send empty text, this should not happen.',
      );
      return;
    }

    if (isDefined(currentUser)) {
      createCommentMutation({
        variables: {
          commentId: v4(),
          authorId: currentUser.id,
          commentThreadId: commentThread.id,
          commentText,
          createdAt: new Date().toISOString(),
        },
        // TODO: find a way to have this configuration dynamic and typed
        refetchQueries: [
          'GetCommentThreadsByTargets',
          'GetPeopleCommentsCount',
          'GetCompanyCommentsCount',
        ],
        onError: (error) => {
          logError(
            `In handleSendComment, createCommentMutation onError, error: ${error}`,
          );
        },
      });
    }
  }

  return (
    <StyledContainer>
      <StyledThreadItemListContainer>
        {commentThread.comments?.map((comment) => (
          <CommentThreadItem key={comment.id} comment={comment} />
        ))}
      </StyledThreadItemListContainer>
      <AutosizeTextInput onSend={handleSendComment} />
    </StyledContainer>
  );
}
