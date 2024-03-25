import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { EventsGroup } from '@/activities/events/components/EventsGroup';
import { Event } from '@/activities/events/types/Event';
import { groupEventsByMonth } from '@/activities/events/utils/groupEventsByMonth';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

type EventListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  events: Event[];
  button?: ReactElement | false;
};

const StyledTimelineContainer = styled.div`
  align-items: center;
  align-self: stretch;

  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-start;

  padding: ${({ theme }) => theme.spacing(4)};
  width: calc(100% - ${({ theme }) => theme.spacing(8)});
`;

export const EventList = ({ events, targetableObject }: EventListProps) => {
  const groupedEvents = groupEventsByMonth(events);

  return (
    <ScrollWrapper>
      <StyledTimelineContainer>
        {groupedEvents.map((group, index) => (
          <EventsGroup
            targetableObject={targetableObject}
            key={group.year.toString() + group.month}
            group={group}
            month={new Date(group.items[0].createdAt).toLocaleString(
              'default',
              { month: 'long' },
            )}
            year={
              index === 0 || group.year !== groupedEvents[index - 1].year
                ? group.year
                : undefined
            }
          />
        ))}
      </StyledTimelineContainer>
    </ScrollWrapper>
  );
};
