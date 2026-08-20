import { styled } from '@linaria/react';
import { useState } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EventList } from '@/activities/timeline-activities/components/EventList';
import { TimelineScopeFilter } from '@/activities/timeline-activities/components/TimelineScopeFilter';
import { useTimelineActivities } from '@/activities/timeline-activities/hooks/useTimelineActivities';
import { type TimelineActivityScope } from '@/activities/timeline-activities/types/TimelineActivityScope';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: none;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};

  justify-content: center;
  overflow: auto;
  padding-left: ${themeCssVariables.spacing[6]};
  padding-right: ${themeCssVariables.spacing[6]};
  padding-top: ${themeCssVariables.spacing[6]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-top: 1px solid ${themeCssVariables.border.color.medium};
    padding-right: ${themeCssVariables.spacing[1]};
    padding-left: ${themeCssVariables.spacing[1]};
  }
`;

const StyledSidePanelPlaceholderWrapper = styled.div`
  > * {
    height: auto;
    padding-top: ${themeCssVariables.spacing[8]};
  }
`;

export const TimelineCard = () => {
  const targetRecord = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();
  const [scope, setScope] = useState<TimelineActivityScope>('all');
  const {
    timelineActivities,
    firstQueryLoading,
    loadingMore,
    fetchMoreRecords,
  } = useTimelineActivities(targetRecord, scope);

  const isTimelineActivitiesEmpty = timelineActivities.length === 0;

  if (firstQueryLoading === true) {
    return <SkeletonLoader withSubSections />;
  }

  // An unfiltered empty timeline has nothing to offer, but a filtered one has
  // to keep the control on screen or the filter cannot be cleared.
  if (isTimelineActivitiesEmpty && scope === 'all') {
    const placeholderContent = (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No activity yet`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There is no activity associated with this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );

    return isInSidePanel ? (
      <StyledSidePanelPlaceholderWrapper>
        {placeholderContent}
      </StyledSidePanelPlaceholderWrapper>
    ) : (
      placeholderContent
    );
  }

  return (
    <StyledMainContainer>
      <TimelineScopeFilter scope={scope} onChange={setScope} />
      {isTimelineActivitiesEmpty ? (
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptySubTitle>
            {scope === 'activity'
              ? t`No linked activity on this record.`
              : t`No field changes recorded on this record.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      ) : (
        <>
          <EventList
            targetableObject={targetRecord}
            title={t`All`}
            events={timelineActivities ?? []}
          />
          <CustomResolverFetchMoreLoader
            loading={loadingMore}
            onLastRowVisible={fetchMoreRecords}
          />
        </>
      )}
    </StyledMainContainer>
  );
};
