import { IconCirclePlus, IconEditCircle, useIcons } from 'twenty-ui';

import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

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

  const IconComponent = getIcon(linkedObjectMetadataItem?.icon);

  return <IconComponent />;
};
