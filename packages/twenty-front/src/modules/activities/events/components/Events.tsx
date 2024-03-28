import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  useIsMobile,
} from 'twenty-ui';

import { EventList } from '@/activities/events/components/EventList';
import { useEvents } from '@/activities/events/hooks/useEvents';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

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

export const Events = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { events } = useEvents(targetableObject);

  if (!isNonEmptyArray(events)) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            No Events
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no events associated with this record.{' '}
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
        events={events ?? []}
      />
    </StyledMainContainer>
  );
};
