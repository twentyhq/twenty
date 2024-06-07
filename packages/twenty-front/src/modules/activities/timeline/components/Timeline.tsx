import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { TimelineCreateButtonGroup } from '@/activities/timeline/components/TimelineCreateButtonGroup';
import { TimelineSkeletonLoader } from '@/activities/timeline/components/TimelineSkeletonLoader';
import { timelineActivitiesForGroupState } from '@/activities/timeline/states/timelineActivitiesForGroupState';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { TimelineItemsContainer } from './TimelineItemsContainer';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: ${({ theme }) =>
    useIsMobile() ? `1px solid ${theme.border.color.medium}` : 'none'};
  display: flex;
  flex-direction: column;
  height: 100%;

  justify-content: center;
`;

export const Timeline = ({
  targetableObject,
  loading,
}: {
  targetableObject: ActivityTargetableObject;
  loading: boolean;
}) => {
  const timelineActivitiesForGroup = useRecoilValue(
    timelineActivitiesForGroupState,
  );

  if (loading) {
    return <TimelineSkeletonLoader />;
  }

  if (timelineActivitiesForGroup.length === 0) {
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
      <TimelineItemsContainer />
    </StyledMainContainer>
  );
};
