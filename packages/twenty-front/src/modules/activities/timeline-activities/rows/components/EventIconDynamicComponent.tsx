import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  getTimelineActivityAction,
  type TimelineActivityAction,
} from 'twenty-shared/timeline';
import {
  IconCirclePlus,
  IconEditCircle,
  type IconComponent,
  IconRestore,
  IconTrash,
} from 'twenty-ui/icon';

const RECORD_CHANGE_ICONS: Partial<
  Record<TimelineActivityAction, IconComponent>
> = {
  created: IconCirclePlus,
  updated: IconEditCircle,
  deleted: IconTrash,
  restored: IconRestore,
};

export const EventIconDynamicComponent = ({
  event,
  linkedObjectMetadataItem,
}: {
  event: TimelineActivity;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
}) => {
  const action = getTimelineActivityAction(event);

  const ActionIcon = RECORD_CHANGE_ICONS[action];

  if (ActionIcon) {
    return <ActionIcon />;
  }

  return <ObjectMetadataIcon objectMetadataItem={linkedObjectMetadataItem} />;
};
