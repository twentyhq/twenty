import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import {
  AutosizeTextInput,
  AutosizeTextInputVariant,
} from '@/ui/input/autosize-text/components/AutosizeTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
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
  padding-bottom: ${({ theme }) => theme.spacing(32)};
  padding-left: ${({ theme }) => theme.spacing(12)};
  width: 100%;
`;

const StyledCommentActionBar = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  bottom: 0;
  display: flex;
  padding: 16px 24px 16px 48px;
  position: absolute;
  width: calc(
    ${({ theme }) => (useIsMobile() ? '100%' : theme.rightDrawerWidth)} - 72px
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
      onCompleted: () => {
        setTimeout(() => {
          handleFocus();
        }, 100);
      },
      awaitRefetchQueries: true,
    });
  }

  function handleFocus() {
    const scrollableContainer = document.getElementById(
      'activity-editor-container',
    );
    scrollableContainer?.scrollTo({
      top: scrollableContainer.scrollHeight,
      behavior: 'smooth',
    });
  }

  return (
    <>
      {activity?.comments.length > 0 && (
        <>
          <StyledThreadItemListContainer>
            <StyledThreadCommentTitle>Comments</StyledThreadCommentTitle>
            {activity?.comments?.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </StyledThreadItemListContainer>
        </>
      )}

      <StyledCommentActionBar>
        {currentUser && (
          <AutosizeTextInput
            onValidate={handleSendComment}
            onFocus={handleFocus}
            variant={AutosizeTextInputVariant.Button}
            placeholder={activity?.comments.length > 0 ? 'Reply...' : undefined}
          />
        )}
      </StyledCommentActionBar>
    </>
  );
}
