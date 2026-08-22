import { TIMELINE_ACTIVITY_ROW_COMPONENT_BY_RENDERER } from '@/activities/timeline-activities/constants/TimelineActivityRowComponentByRenderer';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type TimelineActivityRenderer } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

const getLegacyTimelineActivityRenderer = (
  linkedObjectNameSingular: string | undefined,
): TimelineActivityRenderer => {
  switch (linkedObjectNameSingular) {
    case CoreObjectNameSingular.Note:
    case CoreObjectNameSingular.Task:
      return 'activity';
    case CoreObjectNameSingular.Message:
      return 'message';
    case CoreObjectNameSingular.CalendarEvent:
      return 'calendarEvent';
    default:
      return isDefined(linkedObjectNameSingular)
        ? 'genericLinked'
        : 'mainObject';
  }
};

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
  const renderer =
    eventRenderer ??
    // Old pods can write name-only rows after the 2.33 backfill has run.
    (isDefined(event.timelineActivityTypeId)
      ? isDefined(linkedObjectMetadataItem)
        ? 'genericLinked'
        : 'mainObject'
      : getLegacyTimelineActivityRenderer(
          linkedObjectMetadataItem?.nameSingular,
        ));

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
