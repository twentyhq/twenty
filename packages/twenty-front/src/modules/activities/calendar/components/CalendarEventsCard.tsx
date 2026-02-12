import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { format, getYear } from 'date-fns';
import { useRecoilValue } from 'recoil';

import { CalendarMonthCard } from '@/activities/calendar/components/CalendarMonthCard';
import { TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE } from '@/activities/calendar/constants/Calendar';
import { CalendarContext } from '@/activities/calendar/contexts/CalendarContext';
import { getTimelineCalendarEventsFromCompanyId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromCompanyId';
import { getTimelineCalendarEventsFromOpportunityId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromOpportunityId';
import { getTimelineCalendarEventsFromPersonId } from '@/activities/calendar/graphql/queries/getTimelineCalendarEventsFromPersonId';
import { useCalendarEvents } from '@/activities/calendar/hooks/useCalendarEvents';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useCustomResolver } from '@/activities/hooks/useCustomResolver';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { H3Title } from 'twenty-ui/display';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  Section,
} from 'twenty-ui/layout';
import { type TimelineCalendarEventsWithTotal } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  overflow: scroll;
`;

const StyledYear = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledTitleContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const CalendarEventsCard = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { localeCatalog } = useRecoilValue(dateLocaleState);

  const [query, queryName] =
    targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Person
      ? [
          getTimelineCalendarEventsFromPersonId,
          'getTimelineCalendarEventsFromPersonId',
        ]
      : targetRecord.targetObjectNameSingular === CoreObjectNameSingular.Company
        ? [
            getTimelineCalendarEventsFromCompanyId,
            'getTimelineCalendarEventsFromCompanyId',
          ]
        : [
            getTimelineCalendarEventsFromOpportunityId,
            'getTimelineCalendarEventsFromOpportunityId',
          ];

  const { data, firstQueryLoading, isFetchingMore, fetchMoreRecords } =
    useCustomResolver<TimelineCalendarEventsWithTotal>(
      query,
      queryName,
      'timelineCalendarEvents',
      targetRecord,
      TIMELINE_CALENDAR_EVENTS_DEFAULT_PAGE_SIZE,
    );

  const { timelineCalendarEvents, totalNumberOfCalendarEvents } =
    data?.[queryName] ?? {};

  const {
    calendarEventsByDayTime,
    daysByMonthTime,
    monthTimes,
    monthTimesByYear,
  } = useCalendarEvents(timelineCalendarEvents || []);

  const hasMoreCalendarEvents =
    timelineCalendarEvents && totalNumberOfCalendarEvents
      ? timelineCalendarEvents?.length < totalNumberOfCalendarEvents
      : false;

  const handleLastRowVisible = async () => {
    if (hasMoreCalendarEvents) {
      await fetchMoreRecords();
    }
  };

  const objectName = targetRecord.targetObjectNameSingular;

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (!firstQueryLoading && !timelineCalendarEvents?.length) {
    // TODO: change animated placeholder
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
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
          loading={isFetchingMore || firstQueryLoading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledContainer>
    </CalendarContext.Provider>
  );
};
