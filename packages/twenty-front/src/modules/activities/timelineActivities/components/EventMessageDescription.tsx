import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventMessageDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  messageObjectMetadataItem: ObjectMetadataItem | null;
};

export const EventMessageDescription = ({
  event,
  mainObjectMetadataItem,
  messageObjectMetadataItem,
}: EventMessageDescriptionProps) => {
  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'sent': {
      return `sent an email to this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
    }
    case 'received': {
      return `received an email from this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
    }
  }
};
