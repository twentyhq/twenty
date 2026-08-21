import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
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
  eventAction,
  linkedObjectMetadataItem,
}: {
  eventAction: TimelineActivityAction | null;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
}) => {
  const ActionIcon = isDefined(eventAction)
    ? RECORD_CHANGE_ICONS[eventAction]
    : undefined;

  if (ActionIcon) {
    return <ActionIcon />;
  }

  return <ObjectMetadataIcon objectMetadataItem={linkedObjectMetadataItem} />;
};
