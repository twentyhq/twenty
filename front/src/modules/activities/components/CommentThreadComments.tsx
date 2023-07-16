import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { AutosizeTextInput } from '@/ui/input/components/AutosizeTextInput';
import { CommentThread, useCreateCommentMutation } from '~/generated/graphql';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { CommentThreadItem } from '../comment/CommentThreadItem';
import { GET_COMMENT_THREAD } from '../queries';
import { CommentForDrawer } from '../types/CommentForDrawer';

type OwnProps = {
  commentThread: Pick<CommentThread, 'id'> & {
    comments: Array<CommentForDrawer>;
  };
};

const StyledThreadItemListContainer = styled.div`
  align-items: flex-start;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};

  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(4)};

  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(12)};
  width: 100%;
`;

const StyledCommentActionBar = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  padding: 16px 24px 16px 48px;
  width: calc(${({ theme }) => theme.rightDrawerWidth} - 48px - 24px);
`;

const StyledThreadCommentTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-transform: uppercase;
`;

export function CommentThreadComments({ commentThread }: OwnProps) {
  const [createCommentMutation] = useCreateCommentMutation();
  const currentUser = useRecoilValue(currentUserState);

  if (!currentUser) {
    return <></>;
  }

  function handleSendComment(commentText: string) {
    if (!isNonEmptyString(commentText)) {
      return;
    }

    createCommentMutation({
      variables: {
        commentId: v4(),
        authorId: currentUser?.id ?? '',
        commentThreadId: commentThread?.id ?? '',
        commentText: commentText,
        createdAt: new Date().toISOString(),
      },
      refetchQueries: [getOperationName(GET_COMMENT_THREAD) ?? ''],
    });
  }

  return (
    <>
      {commentThread?.comments.length > 0 && (
        <>
          <StyledThreadItemListContainer>
            <StyledThreadCommentTitle>Comments</StyledThreadCommentTitle>
            {commentThread?.comments?.map((comment, index) => (
              <CommentThreadItem key={comment.id} comment={comment} />
            ))}
          </StyledThreadItemListContainer>
        </>
      )}

      <StyledCommentActionBar>
        {currentUser && <AutosizeTextInput onValidate={handleSendComment} />}
      </StyledCommentActionBar>
    </>
  );
}
