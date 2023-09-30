import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconCheckbox, IconNotes } from '@/ui/icon';
import { Avatar } from '@/users/components/Avatar';
import { Activity, ActivityType, User } from '~/generated/graphql';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

const StyledAvatarContainer = styled.div`
  align-items: center;
  display: flex;
  height: 26px;
  justify-content: center;
  user-select: none;
  width: 26px;
  z-index: 2;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 16px;
  justify-content: center;
  text-decoration-line: underline;
  width: 16px;
`;

const StyledActivityTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex: 1;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  overflow: hidden;
`;

const StyledActivityLink = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  overflow: hidden;
  text-decoration-line: underline;
  text-overflow: ellipsis;
`;

const StyledItemTitleContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
  height: 20px;
  overflow: hidden;
`;

const StyledItemTitleDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-left: auto;
`;

const StyledVerticalLineContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  width: 26px;
  z-index: 2;
`;

const StyledVerticalLine = styled.div`
  align-self: stretch;
  background: ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  width: 2px;
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

const StyledTimelineItemContainer = styled.div<{ isGap?: boolean }>`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: ${({ isGap, theme }) => (isGap ? theme.spacing(3) : 'auto')};
  overflow: hidden;
  white-space: nowrap;
`;

type OwnProps = {
  activity: Pick<
    Activity,
    'id' | 'title' | 'body' | 'createdAt' | 'completedAt' | 'type'
  > & {
    author: Pick<Activity['author'], 'displayName' | 'avatarUrl' | 'firstName'>;
  } & {
    assignee?: Pick<User, 'id' | 'displayName'> | null;
  };
  isLastActivity?: boolean;
};

export const TimelineActivity = ({ activity, isLastActivity }: OwnProps) => {
  const beautifiedCreatedAt = beautifyPastDateRelativeToNow(activity.createdAt);
  const exactCreatedAt = beautifyExactDateTime(activity.createdAt);
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const theme = useTheme();

  return (
    <>
      <StyledTimelineItemContainer>
        <StyledAvatarContainer>
          <Avatar
            avatarUrl={activity.author.avatarUrl}
            placeholder={activity.author.firstName ?? ''}
            size="sm"
            type="rounded"
          />
        </StyledAvatarContainer>
        <StyledItemTitleContainer>
          <span>{activity.author.displayName}</span>
          created a {activity.type.toLowerCase()}
          <StyledIconContainer>
            {activity.type === ActivityType.Note && (
              <IconNotes size={theme.icon.size.sm} />
            )}
            {activity.type === ActivityType.Task && (
              <IconCheckbox size={theme.icon.size.sm} />
            )}
          </StyledIconContainer>
          {(activity.type === ActivityType.Note ||
            activity.type === ActivityType.Task) && (
            <StyledActivityTitle
              onClick={() => openActivityRightDrawer(activity.id)}
            >
              “
              <StyledActivityLink title={activity.title ?? '(No Title)'}>
                {activity.title ?? '(No Title)'}
              </StyledActivityLink>
              “
            </StyledActivityTitle>
          )}
          <StyledItemTitleDate id={`id-${activity.id}`}>
            {beautifiedCreatedAt}
          </StyledItemTitleDate>
          <StyledTooltip
            anchorSelect={`#id-${activity.id}`}
            content={exactCreatedAt}
            clickable
            noArrow
          />
        </StyledItemTitleContainer>
      </StyledTimelineItemContainer>
      {!isLastActivity && (
        <StyledTimelineItemContainer isGap>
          <StyledVerticalLineContainer>
            <StyledVerticalLine></StyledVerticalLine>
          </StyledVerticalLineContainer>
        </StyledTimelineItemContainer>
      )}
    </>
  );
};
