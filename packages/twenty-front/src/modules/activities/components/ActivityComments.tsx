import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { Comment } from '@/activities/comment/Comment';
import { Comment as CommentType } from '@/activities/types/Comment';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import {
  AutosizeTextInput,
  AutosizeTextInputVariant,
} from '@/ui/input/components/AutosizeTextInput';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

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
  background: ${({ theme }) => theme.background.primary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  padding: 16px 24px 16px 48px;
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

type ActivityCommentsProps = {
  activityId: string;
  scrollableContainerRef: React.RefObject<HTMLDivElement>;
};

export const ActivityComments = ({
  activityId,
  scrollableContainerRef,
}: ActivityCommentsProps) => {
  const { createOneRecord: createOneComment } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Comment,
  });

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: comments } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Comment,
    skip: !isNonEmptyString(activityId),
    filter: {
      activityId: {
        eq: activityId,
      },
    },
  });

  if (!currentWorkspaceMember) {
    return <></>;
  }

  const handleSendComment = (commentText: string) => {
    if (!isNonEmptyString(commentText)) {
      return;
    }

    createOneComment?.({
      id: v4(),
      authorId: currentWorkspaceMember?.id ?? '',
      author: currentWorkspaceMember,
      activityId: activityId,
      body: commentText,
      createdAt: new Date().toISOString(),
    });
  };

  const handleFocus = () => {
    const scrollableContainer = scrollableContainerRef.current;

    scrollableContainer?.scrollTo({
      top: scrollableContainer.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {comments.length > 0 && (
        <>
          <StyledThreadItemListContainer>
            <StyledThreadCommentTitle>Comments</StyledThreadCommentTitle>
            {comments?.map((comment) => (
              <Comment key={comment.id} comment={comment as CommentType} />
            ))}
          </StyledThreadItemListContainer>
        </>
      )}

      <StyledCommentActionBar>
        {currentWorkspaceMember && (
          <AutosizeTextInput
            onValidate={handleSendComment}
            onFocus={handleFocus}
            variant={AutosizeTextInputVariant.Button}
            placeholder={comments.length > 0 ? 'Reply...' : undefined}
          />
        )}
      </StyledCommentActionBar>
    </>
  );
};
