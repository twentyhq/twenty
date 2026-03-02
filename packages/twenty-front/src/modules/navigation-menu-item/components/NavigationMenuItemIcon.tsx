import { useTheme } from '@emotion/react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useObjectNavItemColor } from '@/navigation-menu-item/hooks/useObjectNavItemColor';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/get-navigation-menu-item-icon-style-from-color';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/utils/getEffectiveNavigationMenuItemColor';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const { Icon: StandardIcon, IconColor } = useGetStandardObjectIcon(
    navigationMenuItem.objectNameSingular ?? '',
  );

  const isRecord =
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD;
  const isViewWithOverlay =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW &&
    navigationMenuItem.viewKey !== ViewKey.Index;

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === navigationMenuItem.objectNameSingular,
  );
  const objectNavItemColor = useObjectNavItemColor(
    navigationMenuItem.objectNameSingular ?? '',
  );
  const objectIconForView =
    objectMetadataItem?.icon != null
      ? getIcon(objectMetadataItem.icon)
      : StandardIcon;

  const canShowViewOverlay =
    isViewWithOverlay &&
    isDefined(objectIconForView) &&
    isDefined(navigationMenuItem.Icon);

  if (canShowViewOverlay) {
    return (
      <ObjectIconWithViewOverlay
        ObjectIcon={objectIconForView}
        ViewIcon={getIcon(navigationMenuItem.Icon!)}
        objectColor={objectNavItemColor}
      />
    );
  }

  const iconToUse =
    StandardIcon ??
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);
  const effectiveColor =
    getEffectiveNavigationMenuItemColor(navigationMenuItem);
  const useStyledIcon =
    isNavigationMenuItemEditingEnabled &&
    !isRecord &&
    isNonEmptyString(effectiveColor);
  const iconStyle = useStyledIcon
    ? getNavigationMenuItemIconStyleFromColor(theme, effectiveColor)
    : null;

  const iconColorToUse = iconStyle
    ? iconStyle.iconColor
    : StandardIcon
      ? IconColor
      : theme.font.color.secondary;

  const avatar = (
    <Avatar
      size={iconStyle ? 'sm' : 'md'}
      type={navigationMenuItem.avatarType}
      Icon={iconToUse}
      iconColor={iconColorToUse}
      avatarUrl={navigationMenuItem.avatarUrl}
      placeholder={navigationMenuItem.labelIdentifier}
      placeholderColorSeed={navigationMenuItem.targetRecordId ?? undefined}
    />
  );

  if (!iconStyle) {
    return avatar;
  }

  return (
    <StyledNavigationMenuItemIconContainer
      $backgroundColor={iconStyle.backgroundColor}
      $borderColor={iconStyle.borderColor}
    >
      {avatar}
    </StyledNavigationMenuItemIconContainer>
  );
};
