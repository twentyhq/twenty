import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { CommentThreadForDrawer } from '@/comments/types/CommentThreadForDrawer';
import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { AutosizeTextInput } from '@/ui/components/inputs/AutosizeTextInput';
import { logError } from '@/utils/logs/logError';
import { isDefined } from '@/utils/type-guards/isDefined';
import { isNonEmptyString } from '@/utils/type-guards/isNonEmptyString';
import { useCreateCommentMutation } from '~/generated/graphql';

import { GET_COMMENT_THREADS_BY_TARGETS } from '../services';

import { CommentThreadActionBar } from './CommentThreadActionBar';
import { CommentThreadItem } from './CommentThreadItem';
import { CommentThreadRelationPicker } from './CommentThreadRelationPicker';

type OwnProps = {
  commentThread: CommentThreadForDrawer;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledThreadItemListContainer = styled.div`
  align-items: flex-start;
  display: flex;

  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;

  width: 100%;
`;

export function CommentThread({ commentThread }: OwnProps) {
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
        commentThreadId: commentThread.id,
        commentText,
        createdAt: new Date().toISOString(),
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
      onError: (error) => {
        logError(
          `In handleSendComment, createCommentMutation onError, error: ${error}`,
        );
      },
    });
  }

  return (
    <StyledContainer>
      <StyledThreadItemListContainer>
        {commentThread.comments?.map((comment, index) => (
          <CommentThreadItem
            key={comment.id}
            comment={comment}
            actionBar={
              index === 0 ? (
                <CommentThreadActionBar commentThreadId={commentThread.id} />
              ) : (
                <></>
              )
            }
          />
        ))}
      </StyledThreadItemListContainer>
      <CommentThreadRelationPicker commentThread={commentThread} />
      <AutosizeTextInput onValidate={handleSendComment} />
    </StyledContainer>
  );
}
