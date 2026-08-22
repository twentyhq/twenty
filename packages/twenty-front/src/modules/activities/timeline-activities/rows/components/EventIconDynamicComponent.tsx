import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

export const EventIconDynamicComponent = ({
  eventIcon,
  linkedObjectMetadataItem,
}: {
  eventIcon: string | null;
  linkedObjectMetadataItem: EnrichedObjectMetadataItem | null;
}) => {
  const { getIcon } = useIcons();

  if (!isDefined(eventIcon)) {
    return <ObjectMetadataIcon objectMetadataItem={linkedObjectMetadataItem} />;
  }

  const EventIcon = getIcon(eventIcon);

  return <EventIcon />;
};
