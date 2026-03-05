import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { format } from 'date-fns';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CalendarChannelVisibility,
  type TimelineCalendarEvent,
} from '~/generated/graphql';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { getCalendarEventEndDate } from '@/activities/calendar/utils/getCalendarEventEndDate';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { hasCalendarEventEnded } from '@/activities/calendar/utils/hasCalendarEventEnded';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { useContext } from 'react';
import { IconArrowRight } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type CalendarEventRowProps = {
  calendarEvent: TimelineCalendarEvent;
  className?: string;
};

const StyledContainer = styled.div<{ showTitle?: boolean }>`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[3]};
  height: ${themeCssVariables.spacing[6]};
  position: relative;
  cursor: ${({ showTitle }) => (showTitle ? 'pointer' : 'not-allowed')};
`;

const StyledAttendanceIndicator = styled.div<{ active?: boolean }>`
  background-color: ${({ active }) =>
    active
      ? themeCssVariables.tag.background.red
      : themeCssVariables.tag.background.gray};
  height: 100%;
  width: ${themeCssVariables.spacing[1]};
  border-radius: ${themeCssVariables.border.radius.xs};
`;

const StyledLabels = styled.div`
  align-items: center;
  display: flex;
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
  flex: 1 0 auto;
`;

const StyledTime = styled.div`
  align-items: center;
  display: flex;
  color: ${themeCssVariables.font.color.tertiary};
  gap: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[26]};
`;

const StyledTitle = styled.div<{ active: boolean; canceled: boolean }>`
  color: ${({ active }) =>
    active ? themeCssVariables.font.color.primary : 'inherit'};
  flex: 1 0 auto;
  font-weight: ${({ active }) =>
    active ? themeCssVariables.font.weight.medium : 'inherit'};
  overflow: hidden;
  text-decoration: ${({ canceled }) => (canceled ? 'line-through' : 'none')};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${themeCssVariables.spacing[10]};
`;

export const CalendarEventRow = ({
  calendarEvent,
  className,
}: CalendarEventRowProps) => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { openCalendarEventInSidePanel } = useOpenCalendarEventInSidePanel();

  const startsAt = getCalendarEventStartDate(calendarEvent);
  const endsAt = getCalendarEventEndDate(calendarEvent);
  const hasEnded = hasCalendarEventEnded(calendarEvent);

  const startTimeLabel = calendarEvent.isFullDay
    ? t`All day`
    : format(startsAt, 'HH:mm');
  const endTimeLabel = calendarEvent.isFullDay ? '' : format(endsAt, 'HH:mm');

  const isCurrentWorkspaceMemberAttending = calendarEvent.participants?.some(
    ({ workspaceMemberId }) => workspaceMemberId === currentWorkspaceMember?.id,
  );
  const showTitle =
    calendarEvent.visibility === CalendarChannelVisibility.SHARE_EVERYTHING;

  return (
    <StyledContainer
      className={className}
      showTitle={showTitle}
      onClick={
        showTitle
          ? () => {
              openCalendarEventInSidePanel(calendarEvent.id);
            }
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
          <CalendarEventNotSharedContent />
        )}
      </StyledLabels>
      {!!calendarEvent.participants?.length && (
        <CalendarEventParticipantsAvatarGroup
          participants={calendarEvent.participants}
        />
      )}
    </StyledContainer>
  );
};
