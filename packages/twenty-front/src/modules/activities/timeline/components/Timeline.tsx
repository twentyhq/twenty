import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { TimelineCreateButtonGroup } from '@/activities/timeline/components/TimelineCreateButtonGroup';
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

const StyledSkeletonContainer = styled.div`
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(8)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
  align-content: flex-start;
`;

const StyledSkeletonSubSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
`;

const StyledSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={80}
    >
      <Skeleton width={24} height={84} />
    </SkeletonTheme>
  );
};

const StyledTimelineSkeletonLoader = () => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: 3 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton width={440} height={16} />
        {skeletonItems.map(({ id }) => (
          <StyledSkeletonSubSection key={id}>
            <StyledSkeletonLoader />
            <StyledSkeletonColumn>
              <Skeleton width={400} height={24} />
              <Skeleton width={400} height={24} />
            </StyledSkeletonColumn>
          </StyledSkeletonSubSection>
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

export const Timeline = ({
  targetableObject,
  loading,
}: {
  targetableObject: ActivityTargetableObject;
  loading?: boolean;
}) => {
  const timelineActivitiesForGroup = useRecoilValue(
    timelineActivitiesForGroupState,
  );

  if (loading === true) {
    return <StyledTimelineSkeletonLoader />;
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
