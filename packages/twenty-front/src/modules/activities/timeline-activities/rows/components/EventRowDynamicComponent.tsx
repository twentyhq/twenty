import { TIMELINE_ACTIVITY_ROW_COMPONENT_BY_RENDERER } from '@/activities/timeline-activities/constants/TimelineActivityRowComponentByRenderer';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { isDefined } from 'twenty-shared/utils';

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
  // A type naming no renderer comes from an application that did not pick one,
  // so the row falls back on whether it is about a linked record.
  const renderer =
    eventRenderer ??
    (isDefined(linkedObjectMetadataItem) ? 'genericLinked' : 'mainObject');

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
