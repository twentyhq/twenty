import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventCalendarEventDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  calendarEventObjectMetadataItem: ObjectMetadataItem | null;
};

export const EventCalendarEventDescription = ({
  event,
  mainObjectMetadataItem,
  calendarEventObjectMetadataItem,
}: EventCalendarEventDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'sent': {
      return `created an event`;
    }
    case 'received': {
      return `has been invited to an event`;
    }
  }
};
