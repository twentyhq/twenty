import { CalendarEventsEmptyState } from '@/activities/calendar/components/CalendarEventsEmptyState';
import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { format, getYear } from 'date-fns';
import { Section } from 'twenty-ui/components/layout';

import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { dateLocaleState } from '@/localization/states/dateLocaleState';

const StyledContainer = styled(StyledWidgetScrollContainer)`
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledMonthHeading = styled(Heading)`
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type CalendarEventsCardContentProps = {
  firstQueryLoading: boolean;
  isFetchingMore: boolean;
  objectName: string;
  onLastRowVisible: () => Promise<void>;
  timelineCalendarEvents: TimelineCalendarEvent[] | undefined;
};

export const CalendarEventsCardContent = ({
  firstQueryLoading,
  isFetchingMore,
  objectName,
  onLastRowVisible,
  timelineCalendarEvents,
}: CalendarEventsCardContentProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(timelineCalendarEvents ?? []);

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (!timelineCalendarEvents?.length) {
    return <CalendarEventsEmptyState objectName={objectName} />;
  }

  return (
    <CalendarContext.Provider
      value={{
        calendarEventsByDayTime,
      }}
    >
      <StyledContainer>
        {monthTimes.map((monthTime) => {
          const monthDayTimes = daysByMonthTime[monthTime] || [];
          const year = getYear(monthTime);
          const lastMonthTimeOfYear = monthTimesByYear[year]?.[0];
          const isLastMonthOfYear = lastMonthTimeOfYear === monthTime;
          const monthLabel = format(monthTime, 'MMMM', {
            locale: localeCatalog,
          });

          return (
            <Section.Root key={monthTime}>
              <StyledMonthHeading level={3} size="md" color="secondary">
                {monthLabel}
                {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
              </StyledMonthHeading>
              <CalendarMonthCard dayTimes={monthDayTimes} />
            </Section.Root>
          );
        })}
        <CustomResolverFetchMoreLoader
          loading={isFetchingMore}
          onLastRowVisible={onLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
