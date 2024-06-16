import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { TimelineCreateButtonGroup } from '@/activities/timeline/components/TimelineCreateButtonGroup';
import { EventList } from '@/activities/timelineActivities/components/EventList';
import { useTimelineActivities } from '@/activities/timelineActivities/hooks/useTimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

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
`;

export const TimelineActivities = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { timelineActivities, loading, fetchMoreRecords } =
    useTimelineActivities(targetableObject);

  if (!isNonEmptyArray(timelineActivities)) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Add your first Activity
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no activities associated with this record.{' '}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <TimelineCreateButtonGroup targetableObject={targetableObject} />
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
