import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { isDefined } from 'twenty-shared/utils';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';

export const EventRowDynamicComponent = ({
  labelIdentifierValue,
  event,
  eventAction,
  eventTypeLabel,
  frontComponentId,
  mainObjectMetadataItem,
  linkedObjectMetadataItem,
  authorFullName,
  createdAt,
}: EventRowDynamicComponentProps) => {
  const EventRowComponent = isDefined(event.linkedRecordId)
    ? EventRowGenericLinked
    : EventRowMainObject;

  const nativeRenderer = (
    <EventRowComponent
      labelIdentifierValue={labelIdentifierValue}
      event={event}
      eventAction={eventAction}
      eventTypeLabel={eventTypeLabel}
      frontComponentId={frontComponentId}
      mainObjectMetadataItem={mainObjectMetadataItem}
      linkedObjectMetadataItem={linkedObjectMetadataItem}
      authorFullName={authorFullName}
      createdAt={createdAt}
    />
  );

  if (!isDefined(frontComponentId)) {
    return nativeRenderer;
  }

  return (
    <FrontComponentRenderer
      frontComponentId={frontComponentId}
      timelineActivityId={event.id}
      loadingFallback={nativeRenderer}
      unavailableFallback={nativeRenderer}
    />
  );
};
