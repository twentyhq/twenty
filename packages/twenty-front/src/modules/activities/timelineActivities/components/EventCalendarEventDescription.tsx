import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventCalendarEventDescriptionProps = {
  eventAction: string;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  calendarEventObjectMetadataItem: ObjectMetadataItem | null;
};

export const EventCalendarEventDescription = ({
  eventAction,
  mainObjectMetadataItem,
  calendarEventObjectMetadataItem,
}: EventCalendarEventDescriptionProps) => {
  switch (eventAction) {
    case 'sent': {
      return `created an event`;
    }
    case 'received': {
      return `has been invited to an event`;
    }
  }
};
