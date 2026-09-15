import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  isDefined,
  isFieldValueRestricted,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { UserContext } from '@/users/contexts/UserContext';
import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '~/utils/format/formatDate';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledEventCardCalendarEventContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledCalendarEventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

const StyledCalendarEventTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  width: 100%;
`;

const StyledCalendarEventTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCalendarEventBody = styled.div`
  align-items: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const StyledCalendarEventDateCard = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.spacing[1]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledCalendarEventDateCardMonth = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCalendarEventDateCardDay = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const EventCardCalendarEvent = ({
  calendarEventId,
}: {
  calendarEventId: string;
}) => {
  const { openCalendarEventInSidePanel } = useOpenCalendarEventInSidePanel();
  const { timeZone } = useContext(UserContext);

  const {
    record: calendarEvent,
    loading,
    error,
  } = useFindOneRecord<CalendarEvent>({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    objectRecordId: calendarEventId,
    recordGqlFields: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      calendarEventParticipants: {
        person: true,
        workspaceMember: true,
        handle: true,
        displayName: true,
      },
      callRecordings: {
        id: true,
        status: true,
        applicationId: true,
      },
    },
  });

  if (isDefined(error)) {
    if (CombinedGraphQLErrors.is(error)) {
      if (
        error.errors.some(
          (graphQLError) => graphQLError.extensions?.code === 'FORBIDDEN',
        )
      ) {
        return <CalendarEventNotSharedContent />;
      }

      if (
        error.errors.some(
          (graphQLError) => graphQLError.extensions?.code === 'NOT_FOUND',
        )
      ) {
        return <div>{t`Calendar event not found`}</div>;
      }
    }

    return <div>{t`Error loading calendar event`}</div>;
  }

  if (loading) {
    return <div>{t`Loading...`}</div>;
  }

  if (!isDefined(calendarEvent)) {
    return <CalendarEventNotSharedContent />;
  }

  if (isFieldValueRestricted(calendarEvent.title)) {
    return <CalendarEventNotSharedContent />;
  }

  if (isUndefinedOrNull(calendarEvent.startsAt)) {
    return <div>{t`Calendar event has no start date`}</div>;
  }

  const startsAtMonth = formatToHumanReadableMonth(
    calendarEvent.startsAt,
    timeZone,
  );
  const startsAtDay = formatToHumanReadableDay(
    calendarEvent.startsAt,
    timeZone,
  );
  const startsAtTime = formatToHumanReadableTime(
    calendarEvent.startsAt,
    timeZone,
  );
  const endsAtTime = isDefined(calendarEvent.endsAt)
    ? formatToHumanReadableTime(calendarEvent.endsAt, timeZone)
    : null;
  return (
    <StyledEventCardCalendarEventContainer
      onClick={() => openCalendarEventInSidePanel(calendarEventId)}
    >
      <StyledCalendarEventDateCard>
        <StyledCalendarEventDateCardMonth>
          {startsAtMonth}
        </StyledCalendarEventDateCardMonth>
        <StyledCalendarEventDateCardDay>
          {startsAtDay}
        </StyledCalendarEventDateCardDay>
      </StyledCalendarEventDateCard>
      <StyledCalendarEventContent>
        <StyledCalendarEventTop>
          <StyledCalendarEventTitle>
            {calendarEvent.title}
          </StyledCalendarEventTitle>
          {(isNonEmptyArray(calendarEvent.calendarEventParticipants) ||
            isNonEmptyArray(calendarEvent.callRecordings)) && (
            <CalendarEventParticipantsAvatarGroup
              participants={calendarEvent.calendarEventParticipants ?? []}
              callRecordings={calendarEvent.callRecordings ?? []}
            />
          )}
        </StyledCalendarEventTop>
        <StyledCalendarEventBody>
          {startsAtTime} {isDefined(endsAtTime) && <>→ {endsAtTime}</>}
        </StyledCalendarEventBody>
      </StyledCalendarEventContent>
    </StyledEventCardCalendarEventContainer>
  );
};
