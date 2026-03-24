import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getObjectColorForNavigationMenuItem } from '@/navigation-menu-item/common/utils/getObjectColorForNavigationMenuItem';
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

  const iconColor = getObjectColorForNavigationMenuItem(objectMetadataItem);

  return <NavigationMenuItemStyleIcon Icon={ObjectIcon} color={iconColor} />;
};
