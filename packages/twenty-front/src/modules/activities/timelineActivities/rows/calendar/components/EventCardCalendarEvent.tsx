import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { useOpenCalendarEventRightDrawer } from '@/activities/calendar/right-drawer/hooks/useOpenCalendarEventRightDrawer';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import {
  formatToHumanReadableDay,
  formatToHumanReadableMonth,
  formatToHumanReadableTime,
} from '~/utils/format/formatDate';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const StyledEventCardCalendarEventContainer = styled.div`
  cursor: pointer;
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
`;

const StyledCalendarEventTop = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
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
  const { upsertRecords } = useUpsertRecordsInStore();

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
    },
    onCompleted: (data) => {
      upsertRecords([data]);
    },
  });

  const { openCalendarEventRightDrawer } = useOpenCalendarEventRightDrawer();

  const { timeZone } = useContext(UserContext);

  if (isDefined(error)) {
    const shouldHideMessageContent = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'FORBIDDEN',
    );

    if (shouldHideMessageContent) {
      return <div>Calendar event not shared</div>;
    }

    const shouldHandleNotFound = error.graphQLErrors.some(
      (e) => e.extensions?.code === 'NOT_FOUND',
    );

    if (shouldHandleNotFound) {
      return <div>Calendar event not found</div>;
    }

    return <div>Error loading calendar event</div>;
  }

  if (loading || isUndefined(calendarEvent)) {
    return <div>Loading...</div>;
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

  return (
    <StyledEventCardCalendarEventContainer
      onClick={() => openCalendarEventRightDrawer(calendarEvent.id)}
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
        </StyledCalendarEventTop>
        <StyledCalendarEventBody>
          {startsAtHour} {endsAtHour && <>→ {endsAtHour}</>}
        </StyledCalendarEventBody>
      </StyledCalendarEventContent>
    </StyledEventCardCalendarEventContainer>
  );
};
