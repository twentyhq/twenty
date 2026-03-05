import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isUndefined } from '@sniptt/guards';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useOpenCalendarEventInSidePanel } from '@/side-panel/hooks/useOpenCalendarEventInSidePanel';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '~/utils/format/formatDate';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledEventCardCalendarEventContainer = styled.div<{
  canOpen?: boolean;
}>`
  cursor: ${({ canOpen }) => (canOpen ? 'pointer' : 'not-allowed')};
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
  width: 100%;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
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
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};

  border-radius: ${themeCssVariables.spacing[1]};
  border: 1px solid ${themeCssVariables.border.color.medium};
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
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { openCalendarEventInSidePanel } = useOpenCalendarEventInSidePanel();

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
    },
    onCompleted: (data) => {
      upsertRecordsInStore({ partialRecords: [data] });
    },
  });

  const { timeZone } = useContext(UserContext);

  if (isDefined(error)) {
    const shouldHideMessageContent = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'FORBIDDEN',
    );

    if (shouldHideMessageContent) {
      return <CalendarEventNotSharedContent />;
    }

    const shouldHandleNotFound = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'NOT_FOUND',
    );

    if (shouldHandleNotFound) {
      return <div>{t`Calendar event not found`}</div>;
    }

    return <div>{t`Error loading calendar event`}</div>;
  }

  if (loading || isUndefined(calendarEvent)) {
    return <div>{t`Loading...`}</div>;
  }

  const startsAtDate = calendarEvent?.startsAt;
  const endsAtDate = calendarEvent?.endsAt;

  if (isUndefinedOrNull(startsAtDate)) {
    throw new Error("Can't render a calendarEvent without a start date");
  }

  const startsAtMonth = formatToHumanReadableMonth(startsAtDate, timeZone);

  const startsAtDay = formatToHumanReadableDay(startsAtDate, timeZone);

  const startsAtHour = formatToHumanReadableTime(startsAtDate, timeZone);
  const endsAtHour = endsAtDate
    ? formatToHumanReadableTime(endsAtDate, timeZone)
    : null;

  const canOpen =
    calendarEvent.title !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

  const handleClick = () => {
    if (canOpen) {
      openCalendarEventInSidePanel(calendarEventId);
    }
  };

  return (
    <StyledEventCardCalendarEventContainer
      onClick={handleClick}
      canOpen={canOpen}
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
          {calendarEvent.title ===
          FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED ? (
            <CalendarEventNotSharedContent />
          ) : (
            <StyledCalendarEventTitle>
              {calendarEvent.title}
            </StyledCalendarEventTitle>
          )}
          {!!calendarEvent.calendarEventParticipants?.length && (
            <CalendarEventParticipantsAvatarGroup
              participants={calendarEvent.calendarEventParticipants}
            />
          )}
        </StyledCalendarEventTop>

        <StyledCalendarEventBody>
          {startsAtHour} {endsAtHour && <>→ {endsAtHour}</>}
        </StyledCalendarEventBody>
      </StyledCalendarEventContent>
    </StyledEventCardCalendarEventContainer>
  );
};
