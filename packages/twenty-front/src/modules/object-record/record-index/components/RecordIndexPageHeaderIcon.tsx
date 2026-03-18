import { isNonEmptyString } from '@sniptt/guards';

import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/common/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const RecordIndexPageHeaderIcon = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}) => {
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);

  if (!isDefined(ObjectIcon)) {
    return null;
  }

  const iconColor = isNonEmptyString(objectMetadataItem?.color)
    ? objectMetadataItem.color
    : getStandardObjectIconColor(objectMetadataItem?.nameSingular ?? '');

  return (
    <NavigationMenuItemStyleIcon
      Icon={ObjectIcon}
      color={iconColor ?? undefined}
    />
  );
};
