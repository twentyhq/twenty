import { isNonEmptyString } from '@sniptt/guards';

import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { usePrefetchedNavigationMenuItemsData } from '@/navigation-menu-item/hooks/usePrefetchedNavigationMenuItemsData';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const RecordIndexPageHeaderIcon = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}) => {
  const theme = useTheme();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const { workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const coreIndexViewId = useAtomFamilySelectorValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );
  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem?.icon);

  if (!ObjectIcon) {
    return null;
  }

  if (!isNavigationMenuItemEditingEnabled) {
    return <ObjectIcon size={theme.icon.size.md} />;
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
