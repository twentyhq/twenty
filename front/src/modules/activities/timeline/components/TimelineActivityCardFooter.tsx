import styled from '@emotion/styled';

import { UserChip } from '@/users/components/UserChip';
import { Activity, User } from '~/generated/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

export type TimelineActivityCardFooterAssignee =
  | (Pick<NonNullable<Activity['assignee']>, 'id'> & {
      user: Pick<User, 'displayName' | 'avatarUrl'>;
    })
  | null;

type TimelineActivityCardFooterProps = {
  activity: Pick<Activity, 'id' | 'dueAt'> & {
    assignee?: TimelineActivityCardFooterAssignee;
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

export const TimelineActivityCardFooter = ({
  activity,
}: TimelineActivityCardFooterProps) => (
  <>
    {(activity.assignee || activity.dueAt) && (
      <StyledContainer>
        {activity.assignee && (
          <UserChip
            id={activity.assignee.id}
            name={activity.assignee?.user.displayName ?? ''}
            pictureUrl={activity.assignee?.user.avatarUrl ?? ''}
          />
        )}
        {activity.dueAt && (
          <>
            {activity.assignee && <StyledVerticalSeparator />}
            {beautifyExactDate(activity.dueAt)}
          </>
        )}
      </StyledContainer>
    )}
  </>
);
