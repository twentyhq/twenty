import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { EventsGroup } from '@/activities/timelineActivities/components/EventsGroup';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { groupEventsByMonth } from '@/activities/timelineActivities/utils/groupEventsByMonth';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

type EventListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  events: TimelineActivity[];
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

  width: calc(100% - ${({ theme }) => theme.spacing(8)});
`;

export const EventList = ({ events, targetableObject }: EventListProps) => {
  const groupedEvents = groupEventsByMonth(events);

  const mainObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  }).objectMetadataItem;

  return (
    <ScrollWrapper>
      <StyledTimelineContainer>
        {groupedEvents.map((group, index) => (
          <EventsGroup
            mainObjectMetadataItem={mainObjectMetadataItem}
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
