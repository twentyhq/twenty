import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { format } from 'date-fns';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  AvatarGroup,
  IconArrowRight,
  IconLock,
  isDefined,
  Card,
  CardContent,
} from 'twenty-ui';

import { CalendarCurrentEventCursor } from '@/activities/calendar/components/CalendarCurrentEventCursor';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useOpenCalendarEventRightDrawer } from '@/activities/calendar/right-drawer/hooks/useOpenCalendarEventRightDrawer';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import {
  CalendarChannelVisibility,
  TimelineCalendarEvent,
} from '~/generated-metadata/graphql';

type CalendarEventRowProps = {
  calendarEvent: TimelineCalendarEvent;
  className?: string;
};

const StyledContainer = styled.div<{ showTitle?: boolean }>`
  align-items: center;
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(3)};
  height: ${({ theme }) => theme.spacing(6)};
  position: relative;
  cursor: ${({ showTitle }) => (showTitle ? 'pointer' : 'not-allowed')};
`;

const StyledAttendanceIndicator = styled.div<{ active?: boolean }>`
  background-color: ${({ theme }) => theme.tag.background.gray};
  height: 100%;
  width: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.xs};

  ${({ active, theme }) =>
    active &&
    css`
      background-color: ${theme.tag.background.red};
    `}
`;

const StyledLabels = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1 0 auto;
`;

const StyledTime = styled.div`
  align-items: center;
  display: flex;
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(1)};
  width: ${({ theme }) => theme.spacing(26)};
`;

const StyledTitle = styled.div<{ active: boolean; canceled: boolean }>`
  flex: 1 0 auto;

  ${({ theme, active }) =>
    active &&
    css`
      color: ${theme.font.color.primary};
      font-weight: ${theme.font.weight.medium};
    `}

  ${({ canceled }) =>
    canceled &&
    css`
      text-decoration: line-through;
    `}
`;

const StyledVisibilityCard = styled(Card)<{ active: boolean }>`
  color: ${({ active, theme }) =>
    active ? theme.font.color.primary : theme.font.color.light};
  border-color: ${({ theme }) => theme.border.color.light};
  flex: 1 0 auto;
  transition: color ${({ theme }) => theme.animation.duration.normal} ease;
`;

const StyledVisibilityCardContent = styled(CardContent)`
  align-items: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0, 1)};
  height: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

export const CalendarEventRow = ({
  calendarEvent,
  className,
}: CalendarEventRowProps) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { displayCurrentEventCursor = false } = useContext(CalendarContext);
  const { openCalendarEventRightDrawer } = useOpenCalendarEventRightDrawer();

  const startsAt = getCalendarEventStartDate(calendarEvent);
  const endsAt = getCalendarEventEndDate(calendarEvent);
  const hasEnded = hasCalendarEventEnded(calendarEvent);

  const startTimeLabel = calendarEvent.isFullDay
    ? 'All day'
    : format(startsAt, 'HH:mm');
  const endTimeLabel = calendarEvent.isFullDay ? '' : format(endsAt, 'HH:mm');

  const isCurrentWorkspaceMemberAttending = calendarEvent.participants?.some(
    ({ workspaceMemberId }) => workspaceMemberId === currentWorkspaceMember?.id,
  );
  const showTitle =
    calendarEvent.visibility === CalendarChannelVisibility.ShareEverything;

  return (
    <StyledContainer
      className={className}
      showTitle={showTitle}
      onClick={
        showTitle
          ? () => openCalendarEventRightDrawer(calendarEvent.id)
          : undefined
      }
    >
      <StyledAttendanceIndicator active={isCurrentWorkspaceMemberAttending} />
      <StyledLabels>
        <StyledTime>
          {startTimeLabel}
          {endTimeLabel && (
            <>
              <IconArrowRight size={theme.icon.size.sm} />
              {endTimeLabel}
            </>
          )}
        </StyledTime>
        {showTitle ? (
          <StyledTitle active={!hasEnded} canceled={!!calendarEvent.isCanceled}>
            {calendarEvent.title}
          </StyledTitle>
        ) : (
          <StyledVisibilityCard active={!hasEnded}>
            <StyledVisibilityCardContent>
              <IconLock size={theme.icon.size.sm} />
              Not shared
            </StyledVisibilityCardContent>
          </StyledVisibilityCard>
        )}
      </StyledLabels>
      {!!calendarEvent.participants?.length && (
        <AvatarGroup
          avatars={calendarEvent.participants.map((participant) => (
            <Avatar
              key={[participant.workspaceMemberId, participant.displayName]
                .filter(isDefined)
                .join('-')}
              avatarUrl={participant.avatarUrl}
              placeholder={
                participant.firstName && participant.lastName
                  ? `${participant.firstName} ${participant.lastName}`
                  : participant.displayName
              }
              placeholderColorSeed={
                participant.workspaceMemberId || participant.personId
              }
              type="rounded"
            />
          ))}
        />
      )}
      {displayCurrentEventCursor && (
        <CalendarCurrentEventCursor calendarEvent={calendarEvent} />
      )}
    </StyledContainer>
  );
};
