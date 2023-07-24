import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { useIsMobile } from '@/ui/hooks/useIsMobile';
import { AutosizeTextInput } from '@/ui/input/components/AutosizeTextInput';
import { Activity, useCreateCommentMutation } from '~/generated/graphql';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { Comment } from '../comment/Comment';
import { GET_ACTIVITY } from '../queries';
import { CommentForDrawer } from '../types/CommentForDrawer';

type OwnProps = {
  activity: Pick<Activity, 'id'> & {
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
  width: calc(
    ${({ theme }) => (useIsMobile() ? '100%' : theme.rightDrawerWidth)} - 48px -
      24px
  );
`;

const StyledThreadCommentTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-transform: uppercase;
`;

export function ActivityComments({ activity }: OwnProps) {
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
        activityId: activity?.id ?? '',
        commentText: commentText,
        createdAt: new Date().toISOString(),
      },
      refetchQueries: [getOperationName(GET_ACTIVITY) ?? ''],
    });
  }

  return (
    <>
      {activity?.comments.length > 0 && (
        <>
          <StyledThreadItemListContainer>
            <StyledThreadCommentTitle>Comments</StyledThreadCommentTitle>
            {activity?.comments?.map((comment, index) => (
              <Comment key={comment.id} comment={comment} />
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
