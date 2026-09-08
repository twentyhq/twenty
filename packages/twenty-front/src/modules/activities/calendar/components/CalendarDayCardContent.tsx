import { styled } from '@linaria/react';
import { differenceInSeconds, endOfDay, format } from 'date-fns';

import { CalendarEventRow } from '@/activities/calendar/components/CalendarEventRow';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { CalendarDayLabel } from 'twenty-ui/data-display';
import { CardContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type TimelineCalendarEvent } from '~/generated/graphql';

type CalendarDayCardContentProps = {
  calendarEvents: TimelineCalendarEvent[];
  divider?: boolean;
};

const StyledCardContentContainer = styled.div`
  > div {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    gap: ${themeCssVariables.spacing[3]};
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  }
`;

const StyledDayCardContent = styled(CardContent)`
  @keyframes calendarDayEnded {
    to {
      background-color: ${themeCssVariables.background.primary};
    }
  }

  animation: calendarDayEnded calc(var(--t-animation-duration-fast) * 1s) ease
    forwards;
`;

const StyledEvents = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledEventRowContainer = styled.div`
  flex: 1 0 auto;
`;

export const CalendarDayCardContent = ({
  calendarEvents,
  divider,
}: CalendarDayCardContentProps) => {
  const endOfDayDate = endOfDay(getCalendarEventStartDate(calendarEvents[0]));
  const dayEndsIn = differenceInSeconds(endOfDayDate, Date.now());

  const weekDayLabel = format(endOfDayDate, 'EE');
  const monthDayLabel = format(endOfDayDate, 'dd');

  return (
    <StyledCardContentContainer>
      <StyledDayCardContent
        divider={divider}
        style={{ animationDelay: `${Math.max(0, dayEndsIn)}s` }}
      >
        <CalendarDayLabel weekday={weekDayLabel} day={monthDayLabel} />
        <StyledEvents>
          {calendarEvents.map((calendarEvent) => (
            <StyledEventRowContainer key={calendarEvent.id}>
              <CalendarEventRow calendarEvent={calendarEvent} />
            </StyledEventRowContainer>
          ))}
        </StyledEvents>
      </StyledDayCardContent>
    </StyledCardContentContainer>
  );
};
