import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, getYear } from 'date-fns';
import { Section } from 'twenty-ui/components';

import { Heading } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled(StyledWidgetScrollContainer)`
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};

  h3 {
    color: ${themeCssVariables.font.color.secondary};
    font-size: ${themeCssVariables.font.size.md};
    font-weight: ${themeCssVariables.font.weight.regular};
    line-height: inherit;
  }
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
  const { t } = useLingui();
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
    // TODO: change animated placeholder
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="noMatchRecord" />
        <EmptyState.Content>
          <EmptyState.Title>{t`No Events`}</EmptyState.Title>
          <EmptyState.Description>
            {t`No events have been scheduled with this ${objectName} yet.`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
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
              <StyledTitleContainer>
                <Heading level={3} size="lg">
                  {monthLabel}
                  {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                </Heading>
              </StyledTitleContainer>
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
