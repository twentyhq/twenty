import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { ActivityCreateButton } from '@/activities/components/ActivityCreateButton';
import { useActivityTargets } from '@/activities/hooks/useActivityTargets';
import { useOpenCreateActivityDrawerV2 } from '@/activities/hooks/useOpenCreateActivityDrawerV2';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
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

const StyledTimelineEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledEmptyTimelineTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTimelineSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const Timeline = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { activityTargets, loadingActivityTargets } = useActivityTargets({
    targetableObject,
  });

  console.log('Timeline', { activityTargets });

  const [initialized, setInitialized] = useState(false);
  const [activitiesForDisplay, setActivitiesForDisplay] = useState<
    ObjectRecord[]
  >([]);

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords({
      skip: !isNonEmptyArray(activityTargets) || loadingActivityTargets,
      objectNameSingular: CoreObjectNameSingular.Activity,
      filter: {
        id: {
          in: activityTargets
            ?.map((activityTarget) => activityTarget.activityId)
            .filter(isNonEmptyString),
        },
      },
      orderBy: {
        createdAt: 'AscNullsFirst',
      },
      onCompleted: (data: ObjectRecordConnection) => {
        console.log({ data });
        setActivitiesForDisplay(data?.edges.map((edge) => edge.node) ?? []);
        setInitialized(true);
      },
    });

  useEffect(() => {
    if (!loadingActivities) {
      setActivitiesForDisplay(activities);
    }
  }, [activities, loadingActivities]);

  console.log({ loadingActivities });

  const openCreateActivity = useOpenCreateActivityDrawerV2({
    targetableObject,
  });

  const showEmptyState =
    !loadingActivities && activitiesForDisplay.length === 0;

  const showLoadingState = !initialized;

  console.log({
    activities,
    showEmptyState,
  });

  if (showLoadingState) {
    return <>Loading ...</>;
  }

  if (showEmptyState) {
    return (
      <StyledTimelineEmptyContainer>
        <StyledEmptyTimelineTitle>No activity yet</StyledEmptyTimelineTitle>
        <StyledEmptyTimelineSubTitle>Create one:</StyledEmptyTimelineSubTitle>
        <ActivityCreateButton
          onNoteClick={() =>
            openCreateActivity({
              type: 'Note',
              targetableObjects: [targetableObject],
            })
          }
          onTaskClick={() =>
            openCreateActivity({
              type: 'Task',
              targetableObjects: [targetableObject],
            })
          }
        />
      </StyledTimelineEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      <TimelineItemsContainer activities={activitiesForDisplay as Activity[]} />
    </StyledMainContainer>
  );
};
