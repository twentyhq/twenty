import styled from '@emotion/styled';

import { UserChip } from '@/users/components/UserChip';
import { Activity, User } from '~/generated/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

type OwnProps = {
  activity: Pick<Activity, 'id' | 'dueAt'> & {
    assignee?: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

const StyledContainer = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
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

export function TimelineActivityCardFooter({ activity }: OwnProps) {
  return (
    <>
      {(activity.assignee || activity.dueAt) && (
        <StyledContainer>
          {activity.assignee && (
            <UserChip
              id={activity.assignee.id}
              name={activity.assignee.displayName ?? ''}
              pictureUrl={activity.assignee.avatarUrl ?? ''}
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
}
