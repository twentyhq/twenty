import { useTheme } from '@emotion/react';
import { Avatar, useIcons } from 'twenty-ui/display';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { ViewKey } from '@/views/types/ViewKey';

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: ProcessedNavigationMenuItem;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    navigationMenuItem.objectNameSingular || '',
  );
  const IconToUse =
    StandardIcon ||
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);

  const placeholderColorSeed = navigationMenuItem.targetRecordId ?? undefined;

  const isRecord =
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD;
  const isLink = navigationMenuItem.itemType === NavigationMenuItemType.LINK;
  const iconColors = getNavigationMenuItemIconColors(theme);
  const isObjectIndexView =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
    navigationMenuItem.viewKey === ViewKey.Index;
  const iconBackgroundColor = isRecord
    ? undefined
    : isLink
      ? iconColors.link
      : navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
          !isObjectIndexView
        ? iconColors.view
        : iconColors.object;

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
