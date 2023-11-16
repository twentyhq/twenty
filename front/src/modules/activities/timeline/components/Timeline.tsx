import React from 'react';
import styled from '@emotion/styled';

import { ActivityCreateButton } from '@/activities/components/ActivityCreateButton';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { Activity } from '@/activities/types/Activity';
import { ActivityForDrawer } from '@/activities/types/ActivityForDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { SortOrder } from '~/generated/graphql';

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

export const Timeline = ({ entity }: { entity: ActivityTargetableEntity }) => {
  const { objects, loading } = useFindManyObjectRecords({
    objectNamePlural: 'activitiesV2',
    filter: {
      companyId: { eq: entity.id },
    },
    orderBy: [
      {
        createdAt: SortOrder.Desc,
      },
    ],
  });

  const openCreateActivity = useOpenCreateActivityDrawer();

  const activities: ActivityForDrawer[] = (objects ?? []) as Activity[];

  if (loading) {
    return <></>;
  }

  if (!activities.length) {
    return (
      <StyledTimelineEmptyContainer>
        <StyledEmptyTimelineTitle>No activity yet</StyledEmptyTimelineTitle>
        <StyledEmptyTimelineSubTitle>Create one:</StyledEmptyTimelineSubTitle>
        <ActivityCreateButton
          onNoteClick={() =>
            openCreateActivity({
              type: 'Note',
              targetableEntities: [entity],
            })
          }
          onTaskClick={() =>
            openCreateActivity({
              type: 'Task',
              targetableEntities: [entity],
            })
          }
        />
      </StyledTimelineEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      <TimelineItemsContainer activities={activities} />
    </StyledMainContainer>
  );
};
