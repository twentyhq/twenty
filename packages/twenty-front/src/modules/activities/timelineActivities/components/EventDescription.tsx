import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type EventDescriptionProps = {
  event: TimelineActivity;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  linkedObjectMetadata: ObjectMetadataItem | null;
};

export const EventDescription = ({
  event,
  mainObjectMetadataItem,
  linkedObjectMetadata,
}: EventDescriptionProps) => {
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;
  const eventType = event.name.split('.')[1];

  switch (eventType) {
    case 'created': {
      if (isUndefinedOrNull(linkedObjectMetadata)) {
        return `created a new ${mainObjectMetadataItem?.labelSingular}`;
      }
      return `created a ${mainObjectMetadataItem?.labelSingular}`;
    }
    case 'updated': {
      const diffKeys = Object.keys(diff);

      if (diffKeys.length === 0) {
        return `updated NAME`;
      }

      if (diffKeys.length === 1) {
        const key = Object.keys(diff)[0];

        return `updated ${key}`;
      }

      if (diffKeys.length === 2) {
        return `${mainObjectMetadataItem?.fields.find(
          (field) => diffKeys[0] === field.name,
        )?.label} and ${mainObjectMetadataItem?.fields.find(
          (field) => diffKeys[1] === field.name,
        )?.label}`;
      }

      if (diffKeys.length > 2) {
        return `${diffKeys[0]} and ${diffKeys.length - 1} other fields`;
      }
      break;
    }
  }
};
