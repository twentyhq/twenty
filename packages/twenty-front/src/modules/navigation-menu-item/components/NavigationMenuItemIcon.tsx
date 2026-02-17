import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ViewKey } from '@/views/types/ViewKey';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: ProcessedNavigationMenuItem;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    navigationMenuItem.objectNameSingular || '',
  );

  const isRecord =
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD;
  const isLink = navigationMenuItem.itemType === NavigationMenuItemType.LINK;
  const isObjectIndexView =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
    navigationMenuItem.viewKey === ViewKey.Index;
  const isViewWithOverlay =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
    !isObjectIndexView;

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === navigationMenuItem.objectNameSingular,
  );
  const ObjectIconForView =
    objectMetadataItem?.icon != null
      ? getIcon(objectMetadataItem.icon)
      : StandardIcon;

  if (
    isViewWithOverlay &&
    isDefined(ObjectIconForView) &&
    isDefined(navigationMenuItem.Icon)
  ) {
    const ViewIcon = getIcon(navigationMenuItem.Icon);
    return (
      <ObjectIconWithViewOverlay
        ObjectIcon={ObjectIconForView}
        ViewIcon={ViewIcon}
      />
    );
  }

  const IconToUse =
    StandardIcon ||
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);

  const placeholderColorSeed = navigationMenuItem.targetRecordId ?? undefined;
  const iconColors = getNavigationMenuItemIconColors(theme);
  const iconBackgroundColor = isNavigationMenuItemEditingEnabled
    ? isRecord
      ? undefined
      : isLink
        ? iconColors.link
        : isViewWithOverlay
          ? iconColors.view
          : iconColors.object
    : undefined;

  const iconColorToUse = iconBackgroundColor
    ? theme.grayScale.gray1
    : StandardIcon
      ? IconColor
      : theme.font.color.secondary;

  const avatar = (
    <Avatar
      size={iconBackgroundColor ? 'sm' : 'md'}
      type={navigationMenuItem.avatarType}
      Icon={IconToUse}
      iconColor={iconColorToUse}
      avatarUrl={navigationMenuItem.avatarUrl}
      placeholder={navigationMenuItem.labelIdentifier}
      placeholderColorSeed={placeholderColorSeed}
    />
  );

  if (!iconBackgroundColor) {
    return avatar;
  }

  return (
    <StyledNavigationMenuItemIconContainer
      $backgroundColor={iconBackgroundColor}
    >
      {avatar}
    </StyledNavigationMenuItemIconContainer>
  );
};
