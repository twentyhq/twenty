import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, IconLink, IconWorld, useIcons } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LinkIconWithLinkOverlay } from '@/navigation-menu-item/components/LinkIconWithLinkOverlay';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useObjectNavItemColor } from '@/navigation-menu-item/hooks/useObjectNavItemColor';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/getNavigationMenuItemIconStyleFromColor';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/utils/getEffectiveNavigationMenuItemColor';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewKey } from '@/views/types/ViewKey';

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: ProcessedNavigationMenuItem;
}) => {
  const { getIcon } = useIcons();
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

  if (navigationMenuItem.itemType === NavigationMenuItemType.LINK) {
    return (
      <LinkIconWithLinkOverlay
        link={navigationMenuItem.link}
        LinkIcon={IconLink}
        DefaultIcon={IconWorld}
        color={getEffectiveNavigationMenuItemColor(navigationMenuItem)}
      />
    );
  }

  const iconToUse =
    StandardIcon ??
    (navigationMenuItem.Icon ? getIcon(navigationMenuItem.Icon) : undefined);
  const effectiveColor =
    getEffectiveNavigationMenuItemColor(navigationMenuItem);
  const useStyledIcon = !isRecord && isNonEmptyString(effectiveColor);
  const iconStyle = useStyledIcon
    ? getNavigationMenuItemIconStyleFromColor(effectiveColor)
    : null;

  const iconColorToUse = iconStyle
    ? iconStyle.iconColor
    : StandardIcon
      ? IconColor
      : themeCssVariables.font.color.secondary;

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
