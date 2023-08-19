import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityCreateButton } from '@/activities/components/ActivityCreateButton';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityForDrawer } from '@/activities/types/ActivityForDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconCircleDot } from '@/ui/icon';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  ActivityType,
  SortOrder,
  useGetActivitiesByTargetsQuery,
} from '~/generated/graphql';

import { TimelineActivity } from './TimelineActivity';

const StyledMainContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  border-top: ${({ theme }) =>
    useIsMobile() ? `1px solid ${theme.border.color.medium}` : 'none'};
  display: flex;
  flex: 1 0 0;
  flex-direction: column;

  justify-content: center;
`;

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;

  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-start;
  overflow-y: ${() => (useIsMobile() ? 'none' : 'auto')};

  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
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

const StyledTopActionBar = styled.div`
  align-items: flex-start;
  align-self: stretch;
  backdrop-filter: ${() => (useIsMobile() ? 'none' : `blur(5px)`)};

  border-bottom: ${({ theme }) =>
    useIsMobile() ? 'none' : `1px solid ${theme.border.color.medium}`};

  border-top-right-radius: ${() => (useIsMobile() ? 'none' : `8px`)};

  display: flex;
  flex-direction: column;
  left: 0px;
  padding: 12px 16px 12px 16px;
  position: ${() => (useIsMobile() ? 'relative' : 'sticky')};
  top: 0px;
`;

const StyledStartIcon = styled.div`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 20px;
  width: 20px;
`;

export function Timeline({ entity }: { entity: ActivityTargetableEntity }) {
  const theme = useTheme();

  const { data: queryResult, loading } = useGetActivitiesByTargetsQuery({
    variables: {
      activityTargetIds: [entity.id],
      orderBy: [
        {
          createdAt: SortOrder.Desc,
        },
      ],
    },
  });

  const openCreateActivity = useOpenCreateActivityDrawer();

  const activities: ActivityForDrawer[] = queryResult?.findManyActivities ?? [];

  if (loading) {
    return <></>;
  }

  if (!activities.length) {
    return (
      <StyledTimelineEmptyContainer>
        <StyledEmptyTimelineTitle>No activity yet</StyledEmptyTimelineTitle>
        <StyledEmptyTimelineSubTitle>Create one:</StyledEmptyTimelineSubTitle>
        <ActivityCreateButton
          onNoteClick={() => openCreateActivity(ActivityType.Note, [entity])}
          onTaskClick={() => openCreateActivity(ActivityType.Task, [entity])}
        />
      </StyledTimelineEmptyContainer>
    );
  }

  return (
    <StyledMainContainer>
      {/* TODO Remove once Notes have been added */}
      <StyledTopActionBar>
        <ActivityCreateButton
          onNoteClick={() => openCreateActivity(ActivityType.Note, [entity])}
          onTaskClick={() => openCreateActivity(ActivityType.Task, [entity])}
        />
      </StyledTopActionBar>
      <StyledTimelineContainer>
        {activities.map((activity) => (
          <TimelineActivity key={activity.id} activity={activity} />
        ))}
        <StyledStartIcon>
          <IconCircleDot size={theme.icon.size.lg} />
        </StyledStartIcon>
      </StyledTimelineContainer>
    </StyledMainContainer>
  );
}
