import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EventList } from '@/activities/timeline-activities/components/EventList';
import { useTimelineActivities } from '@/activities/timeline-activities/hooks/useTimelineActivities';
import { RecordListUpsertRecordsInStoreEffect } from '@/object-record/record-list/components/RecordListUpsertRecordsInStoreEffect';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { t } from '@lingui/core/macro';

import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const StyledMainContainer = styled(StyledWidgetScrollContainer)`
  align-items: flex-start;
  align-self: stretch;
  border-top: none;
  gap: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-top: 1px solid ${themeCssVariables.border.color.medium};
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
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const {
    timelineActivities,
    firstQueryLoading,
    loadingMore,
    fetchMoreRecords,
    linkedRecords,
  } = useTimelineActivities(targetRecord);

  const isTimelineActivitiesEmpty = timelineActivities.length === 0;

  if (firstQueryLoading === true) {
    return <SkeletonLoader withSubSections />;
  }

  if (isTimelineActivitiesEmpty) {
    const placeholderContent = (
      <EmptyState.Root>
        <AnimatedPlaceholder type="emptyTimeline" />
        <EmptyState.Content>
          <EmptyState.Title>{t`No activity yet`}</EmptyState.Title>
          <EmptyState.Description>
            {t`There is no activity associated with this record.`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
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
    <>
      <RecordListUpsertRecordsInStoreEffect records={linkedRecords} />
      <StyledMainContainer>
        <EventList
          targetableObject={targetRecord}
          title={t`All`}
          events={timelineActivities ?? []}
        />
        <CustomResolverFetchMoreLoader
          loading={loadingMore}
          onLastRowVisible={fetchMoreRecords}
        />
      </StyledMainContainer>
    </>
  );
};
