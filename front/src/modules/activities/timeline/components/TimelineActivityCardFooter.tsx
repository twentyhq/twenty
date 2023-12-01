import { isNonEmptyArray } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import CommentCounter from '@/activities/comment/CommentCounter';
import { Activity } from '@/activities/types/Activity';
import { UserChip } from '@/users/components/UserChip';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { beautifyExactDate } from '~/utils/date-utils';

type TimelineActivityCardFooterProps = {
  activity: Pick<Activity, 'id' | 'dueAt' | 'comments'> & {
    assignee?: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'> | null;
  };
};

const StyledContainer = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledVerticalSeparator = styled.div`
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  height: 24px;
`;

const StyledComment = styled.div`
  margin-left: auto;
`;
export const TimelineActivityCardFooter = ({
  activity,
}: TimelineActivityCardFooterProps) => {
  const hasComments = isNonEmptyArray(activity.comments || []);

  return (
    <>
      {(activity.assignee || activity.dueAt || hasComments) && (
        <StyledContainer>
          {activity.assignee && (
            <UserChip
              id={activity.assignee.id}
              name={
                activity.assignee.name.firstName +
                  ' ' +
                  activity.assignee.name.lastName ?? ''
              }
              avatarUrl={activity.assignee.avatarUrl ?? ''}
            />
          )}

          {activity.dueAt && (
            <>
              {activity.assignee && <StyledVerticalSeparator />}
              {beautifyExactDate(activity.dueAt)}
            </>
          )}
          <StyledComment>
            {hasComments && (
              <CommentCounter commentCount={activity.comments?.length || 0} />
            )}
          </StyledComment>
        </StyledContainer>
      )}
    </>
  );
};
