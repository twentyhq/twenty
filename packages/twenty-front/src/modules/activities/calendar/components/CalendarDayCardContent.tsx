import { useContext } from 'react';
import { styled } from '@linaria/react';
import { differenceInSeconds, endOfDay, format } from 'date-fns';

import { CalendarEventRow } from '@/activities/calendar/components/CalendarEventRow';
import { getCalendarEventStartDate } from '@/activities/calendar/utils/getCalendarEventStartDate';
import { CardContent } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type TimelineCalendarEvent } from '~/generated/graphql';

type CalendarDayCardContentProps = {
  calendarEvents: TimelineCalendarEvent[];
  divider?: boolean;
};

const StyledCardContent = styled(CardContent)`
  align-items: flex-start;
  border-color: ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledDayContainer = styled.div`
  text-align: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledWeekDay = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMonthDay = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledEvents = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledEventRow = styled(CalendarEventRow)`
  flex: 1 0 auto;
`;

export const CalendarDayCardContent = ({
  calendarEvents,
  divider,
}: CalendarDayCardContentProps) => {
  const { theme } = useContext(ThemeContext);

  const endOfDayDate = endOfDay(getCalendarEventStartDate(calendarEvents[0]));
  const dayEndsIn = differenceInSeconds(endOfDayDate, Date.now());

  const weekDayLabel = format(endOfDayDate, 'EE');
  const monthDayLabel = format(endOfDayDate, 'dd');

  const upcomingDayCardContentVariants = {
    upcoming: {},
    ended: { backgroundColor: theme.background.primary },
  };

  return (
    <StyledCardContent
      divider={divider}
      initial="upcoming"
      animate="ended"
      variants={upcomingDayCardContentVariants}
      transition={{
        delay: Math.max(0, dayEndsIn),
        duration: theme.animation.duration.fast,
      }}
    >
      <StyledDayContainer>
        <StyledWeekDay>{weekDayLabel}</StyledWeekDay>
        <StyledMonthDay>{monthDayLabel}</StyledMonthDay>
      </StyledDayContainer>
      <StyledEvents>
        {calendarEvents.map((calendarEvent) => (
          <StyledEventRow
            key={calendarEvent.id}
            calendarEvent={calendarEvent}
          />
        ))}
      </StyledEvents>
    </StyledCardContent>
  );
};
