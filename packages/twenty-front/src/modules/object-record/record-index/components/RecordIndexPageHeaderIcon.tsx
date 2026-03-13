import { isNonEmptyString } from '@sniptt/guards';

import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const RecordIndexPageHeaderIcon = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}) => {
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const coreIndexViewId = useAtomFamilySelectorValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);

  if (!isDefined(ObjectIcon)) {
    return null;
  }

  const navItem = isDefined(coreIndexViewId)
    ? workspaceNavigationMenuItems.find(
        (item) => item.viewId === coreIndexViewId,
      )
    : undefined;
  const navigationMenuItemColor = isNonEmptyString(navItem?.color)
    ? navItem.color
    : undefined;
  const iconColor =
    navigationMenuItemColor ??
    getStandardObjectIconColor(objectMetadataItem?.nameSingular ?? '');

  return (
    <NavigationMenuItemStyleIcon
      Icon={ObjectIcon}
      color={iconColor ?? undefined}
    />
  );
};
