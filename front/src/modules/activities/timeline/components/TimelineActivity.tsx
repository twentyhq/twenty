import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { IconNotes } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { Activity, User } from '~/generated/graphql';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

import { TimelineActivityCardFooter } from './TimelineActivityCardFooter';
import { TimelineActivityTitle } from './TimelineActivityTitle';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledItemTitleContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 20px;
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledItemTitleDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;

const StyledVerticalLineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  width: 20px;
`;

const StyledVerticalLine = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  width: 2px;
`;

const StyledCardContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 100%;
  padding: 4px 0px 20px 0px;
  width: ${() => (useIsMobile() ? '100%' : '400px')};
`;

const StyledCard = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};

  box-shadow: 0px 2px 4px 3px
    ${({ theme }) => theme.background.transparent.light};

  box-shadow: 2px 4px 16px 6px
    ${({ theme }) => theme.background.transparent.light};

  color: ${({ theme }) => theme.font.color.primary};

  opacity: 1;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledCardDetailsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledTimelineItemContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

type TimelineActivityProps = {
  activity: Pick<
    Activity,
    'id' | 'title' | 'body' | 'createdAt' | 'completedAt' | 'type'
  > & { author: Pick<Activity['author'], 'displayName'> } & {
    assignee?: Pick<User, 'id' | 'displayName'> | null;
  };
};

export const TimelineActivity = ({ activity }: TimelineActivityProps) => {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(activity.createdAt);
  const exactCreatedAt = beautifyExactDateTime(activity.createdAt);
  const activityContent = JSON.parse(activity.body ?? '{}');
  const body = Array.isArray(activityContent)
    ? activityContent[0].type !== 'image'
      ? activityContent[0].content[0]?.text
      : null
    : null;

  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const { completeTask } = useCompleteTask(activity);

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledIconContainer>
          <IconNotes />
        </StyledIconContainer>
        <StyledItemTitleContainer>
          <span>{activity.author.displayName}</span>
          created a {activity.type.toLowerCase()}
        </StyledItemTitleContainer>
        <StyledItemTitleDate id={`id-${activity.id}`}>
          {beautifiedCreatedAt}
        </StyledItemTitleDate>
        <StyledTooltip
          anchorSelect={`#id-${activity.id}`}
          content={exactCreatedAt}
          clickable
          noArrow
        />
      </StyledTimelineItemContainer>
      <StyledTimelineItemContainer>
        <StyledVerticalLineContainer>
          <StyledVerticalLine></StyledVerticalLine>
        </StyledVerticalLineContainer>
        <StyledCardContainer>
          <StyledCard onClick={() => openActivityRightDrawer(activity.id)}>
            <StyledCardDetailsContainer>
              <TimelineActivityTitle
                title={activity.title ?? ''}
                completed={!!activity.completedAt}
                type={activity.type}
                onCompletionChange={completeTask}
              />
              <StyledCardContent>
                {body && <OverflowingTextWithTooltip text={body ? body : ''} />}
              </StyledCardContent>
            </StyledCardDetailsContainer>
            <TimelineActivityCardFooter activity={activity} />
          </StyledCard>
        </StyledCardContainer>
      </StyledTimelineItemContainer>
    </>
  );
};
