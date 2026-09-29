import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { type ReactElement } from 'react';

import { EventsGroup } from '@/activities/timeline-activities/components/EventsGroup';
import { useTimelineActivityTypeFilter } from '@/activities/timeline-activities/hooks/useTimelineActivityTypeFilter';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { filterOutInvalidTimelineActivities } from '@/activities/timeline-activities/utils/filterOutInvalidTimelineActivities';
import { groupEventsByMonth } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { keepTimelineActivitiesOfSelectedTypes } from '@/activities/timeline-activities/utils/keepTimelineActivitiesOfSelectedTypes';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';

import { themeCssVariables } from 'twenty-ui/theme';

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
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-start;
`;

export const EventList = ({ events, targetableObject }: EventListProps) => {
  const { t } = useLingui();

  const mainObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  }).objectMetadataItem;

  const { objectMetadataItems } = useObjectMetadataItems();

  const {
    effectiveTimelineActivityTypeUniversalIdentifiersFilter,
    timelineActivityTypeMaps,
  } = useTimelineActivityTypeFilter(targetableObject.id);

  const filteredEvents = filterOutInvalidTimelineActivities(
    keepTimelineActivitiesOfSelectedTypes(
      events,
      effectiveTimelineActivityTypeUniversalIdentifiersFilter,
      timelineActivityTypeMaps,
    ),
    targetableObject.targetObjectNameSingular,
    objectMetadataItems,
    timelineActivityTypeMaps,
  );

  const groupedEvents = groupEventsByMonth(filteredEvents);

  if (groupedEvents.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Title>{t`No matching activity`}</EmptyState.Title>
          <EmptyState.Description>
            {t`No activity matches the selected types.`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <StyledTimelineContainer>
      {groupedEvents.map((group, index) => (
        <EventsGroup
          mainObjectMetadataItem={mainObjectMetadataItem}
          key={group.year.toString() + group.month}
          group={group}
          month={new Date(group.items[0].happensAt).toLocaleString('default', {
            month: 'long',
          })}
          year={
            index === 0 || group.year !== groupedEvents[index - 1].year
              ? group.year
              : undefined
          }
        />
      ))}
    </StyledTimelineContainer>
  );
};
