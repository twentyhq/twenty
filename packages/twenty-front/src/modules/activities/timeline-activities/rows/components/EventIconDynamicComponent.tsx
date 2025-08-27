import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  IconCirclePlus,
  IconEditCircle,
  IconRestore,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';

export const EventIconDynamicComponent = ({
  event,
  linkedObjectMetadataItem,
}: {
  event: TimelineActivity;
  linkedObjectMetadataItem: ObjectMetadataItem | null;
}) => {
  const { getIcon } = useIcons();
  const [, eventAction] = event.name.split('.');

  if (eventAction === 'created') {
    return <IconCirclePlus />;
  }
  if (eventAction === 'updated') {
    return <IconEditCircle />;
  }
  if (eventAction === 'deleted') {
    return <IconTrash />;
  }
  if (eventAction === 'restored') {
    return <IconRestore />;
  }

  const IconComponent = getIcon(linkedObjectMetadataItem?.icon);

  return <IconComponent />;
};
