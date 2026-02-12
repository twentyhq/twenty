import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isUndefined } from '@sniptt/guards';

import { CalendarEventNotSharedContent } from '@/activities/calendar/components/CalendarEventNotSharedContent';
import { CalendarEventParticipantsAvatarGroup } from '@/activities/calendar/components/CalendarEventParticipantsAvatarGroup';
import { type CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useOpenCalendarEventInCommandMenu } from '@/command-menu/hooks/useOpenCalendarEventInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
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
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledCalendarEventContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

const StyledCalendarEventTop = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledCalendarEventTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCalendarEventBody = styled.div`
  align-items: flex-start;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  justify-content: center;
`;

const StyledCalendarEventDateCard = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};

  border-radius: ${({ theme }) => theme.spacing(1)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledCalendarEventDateCardMonth = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.xxs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCalendarEventDateCardDay = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const EventCardCalendarEvent = ({
  calendarEventId,
}: {
  calendarEventId: string;
}) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { openCalendarEventInCommandMenu } =
    useOpenCalendarEventInCommandMenu();

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
      openCalendarEventInCommandMenu(calendarEventId);
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
