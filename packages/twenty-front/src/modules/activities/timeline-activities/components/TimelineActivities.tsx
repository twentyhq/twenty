import styled from '@emotion/styled';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EventList } from '@/activities/timeline-activities/components/EventList';
import { useTimelineActivities } from '@/activities/timeline-activities/hooks/useTimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  MOBILE_VIEWPORT,
} from 'twenty-ui';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: ${({ theme }) =>
    useIsMobile() ? `1px solid ${theme.border.color.medium}` : 'none'};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;

  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
  padding-left: ${({ theme }) => theme.spacing(6)};
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-right: ${({ theme }) => theme.spacing(1)};
    padding-left: ${({ theme }) => theme.spacing(1)};
  }
`;

export const TimelineActivities = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { timelineActivities, loading, fetchMoreRecords } =
    useTimelineActivities(targetableObject);

  const isTimelineActivitiesEmpty =
    !timelineActivities || timelineActivities.length === 0;

  if (loading === true) {
    return <SkeletonLoader withSubSections />;
  }

  if (isTimelineActivitiesEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No activity yet
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There is no activity associated with this record.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      <EventList
        targetableObject={targetableObject}
        title="All"
        events={timelineActivities ?? []}
      />
      <CustomResolverFetchMoreLoader
        loading={loading}
        onLastRowVisible={fetchMoreRecords}
      />
    </StyledMainContainer>
  );
};
