import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { format, getYear } from 'date-fns';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H3Title } from 'twenty-ui/typography';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
  width: 100%;
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
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
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noMatchRecord" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No Events`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`No events have been scheduled with this ${objectName} yet.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
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
            <Section key={monthTime}>
              <StyledTitleContainer>
                <H3Title
                  title={
                    <>
                      {monthLabel}
                      {isLastMonthOfYear && <StyledYear> {year}</StyledYear>}
                    </>
                  }
                />
              </StyledTitleContainer>
              <CalendarMonthCard dayTimes={monthDayTimes} />
            </Section>
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
