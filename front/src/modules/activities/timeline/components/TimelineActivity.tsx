import { useCallback } from 'react';
import { Tooltip } from 'react-tooltip';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/queries';
import { IconNotes } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { Activity, User, useUpdateActivityMutation } from '~/generated/graphql';
import {
  beautifyExactDate,
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
  padding: 4px 0px 20px 0px;
`;

const StyledCard = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 100%;
  position: relative;
  width: 400px;
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
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
  width: 100%;
`;

const StyledTimelineItemContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 16px;
`;

type OwnProps = {
  activity: Pick<
    Activity,
    'id' | 'title' | 'body' | 'createdAt' | 'completedAt' | 'type'
  > & { author: Pick<Activity['author'], 'displayName'> } & {
    assignee?: Pick<User, 'id' | 'displayName'> | null;
  };
};

export function TimelineActivity({ activity }: OwnProps) {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(activity.createdAt);
  const exactCreatedAt = beautifyExactDate(activity.createdAt);
  const body = JSON.parse(activity.body ?? '{}')[0]?.content[0]?.text;

  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const [updateActivityMutation] = useUpdateActivityMutation();

  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      updateActivityMutation({
        variables: {
          where: { id: activity.id },
          data: {
            completedAt: value ? new Date().toISOString() : null,
          },
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? ''],
      });
    },
    [activity, updateActivityMutation],
  );

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
          {beautifiedCreatedAt} ago
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
                onCompletionChange={handleActivityCompletionChange}
              />
              <StyledCardContent>
                <OverflowingTextWithTooltip
                  text={body ? body : '(No content)'}
                />
              </StyledCardContent>
            </StyledCardDetailsContainer>
            <TimelineActivityCardFooter activity={activity} />
          </StyledCard>
        </StyledCardContainer>
      </StyledTimelineItemContainer>
    </>
  );
}
