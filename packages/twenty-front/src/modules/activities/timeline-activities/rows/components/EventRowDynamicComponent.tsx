import { TIMELINE_ACTIVITY_ROW_COMPONENT_BY_RENDERER } from '@/activities/timeline-activities/constants/TimelineActivityRowComponentByRenderer';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { getTimelineActivityRenderer } from '@/activities/timeline-activities/utils/getTimelineActivityRenderer';

export const EventRowDynamicComponent = ({
  labelIdentifierValue,
  event,
  eventAction,
  eventRenderer,
  mainObjectMetadataItem,
  linkedObjectMetadataItem,
  authorFullName,
  createdAt,
}: EventRowDynamicComponentProps) => {
  const renderer = getTimelineActivityRenderer({
    eventRenderer,
    legacyName: event.name,
    linkedObjectNameSingular: linkedObjectMetadataItem?.nameSingular,
  });

  const EventRowComponent =
    TIMELINE_ACTIVITY_ROW_COMPONENT_BY_RENDERER[renderer];

  return (
    <EventRowComponent
      labelIdentifierValue={labelIdentifierValue}
      event={event}
      eventAction={eventAction}
      eventRenderer={eventRenderer}
      mainObjectMetadataItem={mainObjectMetadataItem}
      linkedObjectMetadataItem={linkedObjectMetadataItem}
      authorFullName={authorFullName}
      createdAt={createdAt}
    />
  );
};
