import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityForDrawer } from '@/activities/types/ActivityForDrawer';
import { IconCircleDot } from '@/ui/icon';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

import { TimelineActivity } from './TimelineActivity';

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;

  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-start;

  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const StyledStartIcon = styled.div`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 20px;
  width: 20px;
`;

const StyledScrollWrapper = styled(ScrollWrapper)``;

export type TimelineItemsContainerProps = {
  activities: ActivityForDrawer[];
};

export function TimelineItemsContainer({
  activities,
}: TimelineItemsContainerProps) {
  const theme = useTheme();
  return (
    <StyledScrollWrapper>
      <StyledTimelineContainer>
        {activities.map((activity) => (
          <TimelineActivity key={activity.id} activity={activity} />
        ))}
        <StyledStartIcon>
          <IconCircleDot size={theme.icon.size.lg} />
        </StyledStartIcon>
      </StyledTimelineContainer>
    </StyledScrollWrapper>
  );
}
