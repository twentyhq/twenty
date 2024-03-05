import { useState } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { endOfDay, format, isPast, isToday } from 'date-fns';

import { CalendarEventRow } from '@/activities/calendar/components/CalendarEventRow';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { findNextCalendarEvent } from '@/activities/calendar/utils/findNextCalendarEvent';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type CalendarDayCardContentProps = {
  calendarEvents: CalendarEvent[];
  divider?: boolean;
};

const StyledCardContent = styled(CardContent)<{ active: boolean }>`
  align-items: flex-start;
  border-color: ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(2, 3)};

  ${({ active }) =>
    !active &&
    css`
      background-color: transparent;
    `}
`;

const StyledDayContainer = styled.div`
  text-align: center;
  width: ${({ theme }) => theme.spacing(6)};
`;

const StyledWeekDay = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xxs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledMonthDay = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledEvents = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledEventRow = styled(CalendarEventRow)`
  flex: 1 0 auto;
`;

export const CalendarDayCardContent = ({
  calendarEvents,
  divider,
}: CalendarDayCardContentProps) => {
  const endOfDayDate = endOfDay(calendarEvents[0].startsAt);
  const isDayToday = isToday(endOfDayDate);
  const isPastDay = isPast(endOfDayDate);

  const weekDayLabel = format(endOfDayDate, 'EE');
  const monthDayLabel = format(endOfDayDate, 'dd');

  const [nextCalendarEvent, setNextCalendarEvent] = useState(
    isDayToday ? findNextCalendarEvent(calendarEvents) : undefined,
  );

  return (
    <StyledCardContent active={!isPastDay} divider={divider}>
      <StyledDayContainer>
        <StyledWeekDay>{weekDayLabel}</StyledWeekDay>
        <StyledMonthDay>{monthDayLabel}</StyledMonthDay>
      </StyledDayContainer>
      <StyledEvents>
        {calendarEvents.map((calendarEvent, index) => (
          <StyledEventRow
            key={calendarEvent.id}
            calendarEvent={calendarEvent}
            isNextEvent={nextCalendarEvent?.id === calendarEvent.id}
            onEventEnd={() =>
              setNextCalendarEvent(
                index === 0 ? undefined : calendarEvents[index - 1],
              )
            }
          />
        ))}
      </StyledEvents>
    </StyledCardContent>
  );
};
