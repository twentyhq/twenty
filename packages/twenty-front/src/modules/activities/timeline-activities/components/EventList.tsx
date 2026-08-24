import { styled } from '@linaria/react';
import { type ReactElement } from 'react';

import { EventsGroup } from '@/activities/timeline-activities/components/EventsGroup';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { useTimelineActivityTypes } from '@/activities/timeline-activities/hooks/useTimelineActivityTypes';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { filterOutInvalidTimelineActivities } from '@/activities/timeline-activities/utils/filterOutInvalidTimelineActivities';
import { keepTimelineActivitiesOfSelectedTypes } from '@/activities/timeline-activities/utils/keepTimelineActivitiesOfSelectedTypes';
import { groupEventsByMonth } from '@/activities/timeline-activities/utils/groupEventsByMonth';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-start;
`;

export const EventList = ({ events, targetableObject }: EventListProps) => {
  const { t } = useLingui();

  const mainObjectMetadataItem = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  }).objectMetadataItem;

  const { objectMetadataItems } = useObjectMetadataItems();

  const { timelineActivityTypeMaps } = useTimelineActivityTypes();

  const timelineActivityTypeUniversalIdentifiersFilter =
    useAtomFamilyStateValue(
      timelineActivityTypeUniversalIdentifiersFilterFamilyState,
      targetableObject.id,
    );

  const filteredEvents = filterOutInvalidTimelineActivities(
    keepTimelineActivitiesOfSelectedTypes(
      events,
      timelineActivityTypeUniversalIdentifiersFilter,
      timelineActivityTypeMaps,
    ),
    targetableObject.targetObjectNameSingular,
    objectMetadataItems,
    timelineActivityTypeMaps,
  );

  const groupedEvents = groupEventsByMonth(filteredEvents);

  if (groupedEvents.length === 0) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No matching activity`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`No activity matches the selected types.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-event-list-${targetableObject.id}`}
    >
      <StyledTimelineContainer>
        {groupedEvents.map((group, index) => (
          <EventsGroup
            mainObjectMetadataItem={mainObjectMetadataItem}
            key={group.year.toString() + group.month}
            group={group}
            month={new Date(group.items[0].happensAt).toLocaleString(
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
