import styled from '@emotion/styled';
import { ReactElement } from 'react';

import { EventsGroup } from '@/activities/timelineActivities/components/EventsGroup';
import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { groupEventsByMonth } from '@/activities/timelineActivities/utils/groupEventsByMonth';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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

const filterOutInvalidEvents = (
  events: TimelineActivity[],
  mainObjectMetadataItem: ObjectMetadataItem,
) => {
  const fieldMetadataItemMap: Record<string, FieldMetadataItem> =
    mainObjectMetadataItem.fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field }),
      {},
    );

  const filteredEvents = events.reduce(
    (acc: TimelineActivity[], event: TimelineActivity) => {
      const { properties } = event;
      const diff: Record<string, { before: any; after: any }> =
        properties?.diff ?? {};

      const diffEntriesWithoutDeletedFields = Object.entries(diff).filter(
        ([diffKey, _diffValue]) => fieldMetadataItemMap[diffKey],
      );

      if (diffEntriesWithoutDeletedFields.length > 0) {
        acc.push({
          ...event,
          properties: {
            ...properties,
            diff: Object.fromEntries(diffEntriesWithoutDeletedFields),
          },
        });
      }

      return acc;
    },
    [],
  );

  return filteredEvents;
};

export const EventList = ({ events, targetableObject }: EventListProps) => {
  const mainObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  }).objectMetadataItem;

  const filteredEvents = filterOutInvalidEvents(events, mainObjectMetadataItem);

  const groupedEvents = groupEventsByMonth(filteredEvents);

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
