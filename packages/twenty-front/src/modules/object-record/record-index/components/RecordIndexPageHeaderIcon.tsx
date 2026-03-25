import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const RecordIndexPageHeaderIcon = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: EnrichedObjectMetadataItem;
}) => {
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);

  if (!isDefined(ObjectIcon) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const iconColor = getObjectColorWithFallback(objectMetadataItem);

  return <NavigationMenuItemStyleIcon Icon={ObjectIcon} color={iconColor} />;
};
