import { EventRowActivity } from '@/activities/timeline-activities/rows/activity/components/EventRowActivity';
import { EventRowCalendarEvent } from '@/activities/timeline-activities/rows/calendar/components/EventRowCalendarEvent';
import { type EventRowDynamicComponentProps } from '@/activities/timeline-activities/rows/components/EventRowDynamicComponent.types';
import { EventRowGenericLinked } from '@/activities/timeline-activities/rows/generic/components/EventRowGenericLinked';
import { EventRowMainObject } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObject';
import { EventRowMessage } from '@/activities/timeline-activities/rows/message/components/EventRowMessage';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const EventRowDynamicComponent = (
  props: EventRowDynamicComponentProps,
) => {
  const { linkedObjectMetadataItem } = props;

  if (!isDefined(linkedObjectMetadataItem)) {
    return (
      <EventRowMainObject
        labelIdentifierValue={props.labelIdentifierValue}
        event={props.event}
        mainObjectMetadataItem={props.mainObjectMetadataItem}
        linkedObjectMetadataItem={props.linkedObjectMetadataItem}
        authorFullName={props.authorFullName}
        createdAt={props.createdAt}
      />
    );
  }

  switch (linkedObjectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Message:
      return (
        <EventRowMessage
          labelIdentifierValue={props.labelIdentifierValue}
          event={props.event}
          mainObjectMetadataItem={props.mainObjectMetadataItem}
          linkedObjectMetadataItem={props.linkedObjectMetadataItem}
          authorFullName={props.authorFullName}
        />
      );
    case CoreObjectNameSingular.CalendarEvent:
      return (
        <EventRowCalendarEvent
          labelIdentifierValue={props.labelIdentifierValue}
          event={props.event}
          mainObjectMetadataItem={props.mainObjectMetadataItem}
          linkedObjectMetadataItem={props.linkedObjectMetadataItem}
          authorFullName={props.authorFullName}
        />
      );
    case CoreObjectNameSingular.Note:
      return (
        <EventRowActivity
          labelIdentifierValue={props.labelIdentifierValue}
          event={props.event}
          mainObjectMetadataItem={props.mainObjectMetadataItem}
          linkedObjectMetadataItem={props.linkedObjectMetadataItem}
          authorFullName={props.authorFullName}
          createdAt={props.createdAt}
          objectNameSingular={CoreObjectNameSingular.Note}
        />
      );
    case CoreObjectNameSingular.Task:
      return (
        <EventRowActivity
          labelIdentifierValue={props.labelIdentifierValue}
          event={props.event}
          mainObjectMetadataItem={props.mainObjectMetadataItem}
          linkedObjectMetadataItem={props.linkedObjectMetadataItem}
          authorFullName={props.authorFullName}
          createdAt={props.createdAt}
          objectNameSingular={CoreObjectNameSingular.Task}
        />
      );
    default:
      return (
        <EventRowGenericLinked
          labelIdentifierValue={props.labelIdentifierValue}
          event={props.event}
          mainObjectMetadataItem={props.mainObjectMetadataItem}
          linkedObjectMetadataItem={props.linkedObjectMetadataItem}
          authorFullName={props.authorFullName}
          createdAt={props.createdAt}
        />
      );
  }
};
