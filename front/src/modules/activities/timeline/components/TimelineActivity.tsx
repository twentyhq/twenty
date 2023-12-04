import { Tooltip } from 'react-tooltip';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { Activity } from '@/activities/types/Activity';
import { IconCheckbox, IconNotes } from '@/ui/display/icon';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { Avatar } from '@/users/components/Avatar';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
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

const StyledItemContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  span {
    color: ${({ theme }) => theme.font.color.secondary};
  }
  overflow: hidden;
`;

const StyledItemTitleContainer = styled.div`
  display: flex;
  flex: 1;
  flex-flow: row ${() => (useIsMobile() ? 'wrap' : 'nowrap')};
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledItemAuthorText = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledItemTitle = styled.div`
  display: flex;
  flex-flow: row nowrap;
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
  height: ${({ isGap, theme }) =>
    isGap ? (useIsMobile() ? theme.spacing(6) : theme.spacing(3)) : 'auto'};
  overflow: hidden;
  white-space: nowrap;
`;

type TimelineActivityProps = {
  activity: Pick<
    Activity,
    | 'id'
    | 'title'
    | 'body'
    | 'createdAt'
    | 'completedAt'
    | 'type'
    | 'comments'
    | 'dueAt'
  > & { author: Pick<WorkspaceMember, 'name' | 'avatarUrl'> } & {
    assignee?: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'> | null;
  };
  isLastActivity?: boolean;
};

export const TimelineActivity = ({
  activity,
  isLastActivity,
}: TimelineActivityProps) => {
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
            placeholder={activity.author.name.firstName ?? ''}
            size="sm"
            type="rounded"
          />
        </StyledAvatarContainer>
        <StyledItemContainer>
          <StyledItemTitleContainer>
            <StyledItemAuthorText>
              <span>
                {activity.author.name.firstName} {activity.author.name.lastName}
              </span>
              created a {activity.type.toLowerCase()}
            </StyledItemAuthorText>
            <StyledItemTitle>
              <StyledIconContainer>
                {activity.type === 'Note' && (
                  <IconNotes size={theme.icon.size.sm} />
                )}
                {activity.type === 'Task' && (
                  <IconCheckbox size={theme.icon.size.sm} />
                )}
              </StyledIconContainer>
              {(activity.type === 'Note' || activity.type === 'Task') && (
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
            </StyledItemTitle>
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
        </StyledItemContainer>
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
