import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, IconLink, IconWorld, useIcons } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { LinkIconWithLinkOverlay } from '@/navigation-menu-item/display/link/components/LinkIconWithLinkOverlay';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/display/components/NavigationMenuItemIconContainer';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/display/view/components/ObjectIconWithViewOverlay';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemIconStyleFromColor';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: NavigationMenuItem;
}) => {
  const { getIcon } = useIcons();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const objectNameSingular =
    getNavigationMenuItemObjectNameSingular(
      navigationMenuItem,
      objectMetadataItems,
      views,
    ) ?? '';

  const { Icon: StandardIcon, IconColor } =
    useGetStandardObjectIcon(objectNameSingular);

  const isRecord = navigationMenuItem.type === NavigationMenuItemType.RECORD;

  const view = isDefined(navigationMenuItem.viewId)
    ? views.find((view) => view.id === navigationMenuItem.viewId)
    : undefined;
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );
  const objectIconForView =
    objectMetadataItem?.icon != null
      ? getIcon(objectMetadataItem.icon)
      : StandardIcon;

  const canShowViewOverlay =
    navigationMenuItem.type === NavigationMenuItemType.VIEW &&
    isDefined(view) &&
    isDefined(objectIconForView) &&
    isDefined(view?.icon);

  if (canShowViewOverlay) {
    return (
      <ObjectIconWithViewOverlay
        ObjectIcon={objectIconForView}
        ViewIcon={getIcon(view!.icon)}
        objectColor={getNavigationMenuItemColor(
          navigationMenuItem,
          objectMetadataItem,
        )}
      />
    );
  }

  if (navigationMenuItem.type === NavigationMenuItemType.LINK) {
    const computedLink = getNavigationMenuItemComputedLink(
      navigationMenuItem,
      objectMetadataItems,
      views,
    );
    return (
      <LinkIconWithLinkOverlay
        link={computedLink}
        LinkIcon={IconLink}
        DefaultIcon={IconWorld}
        color={getNavigationMenuItemColor(navigationMenuItem)}
      />
    );
  }

  const itemIcon = isRecord
    ? undefined
    : objectMetadataItem?.icon
      ? getIcon(objectMetadataItem.icon)
      : undefined;
  const iconToUse = StandardIcon ?? itemIcon;

  const effectiveColor = getNavigationMenuItemColor(
    navigationMenuItem,
    objectMetadataItem,
  );
  const useStyledIcon = !isRecord;
  const iconStyle = useStyledIcon
    ? getNavigationMenuItemIconStyleFromColor(effectiveColor)
    : null;

  const iconColorToUse = iconStyle
    ? iconStyle.iconColor
    : StandardIcon
      ? IconColor
      : themeCssVariables.font.color.secondary;

  const labelIdentifier = getNavigationMenuItemLabel(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );

  const recordIdentifier =
    isRecord &&
    isDefined(navigationMenuItem.targetRecordIdentifier) &&
    isDefined(objectMetadataItem)
      ? recordIdentifierToObjectRecordIdentifier({
          recordIdentifier: navigationMenuItem.targetRecordIdentifier,
          objectMetadataItem,
        })
      : null;

  const avatar = (
    <Avatar
      size={iconStyle ? 'sm' : 'md'}
      type={recordIdentifier?.avatarType ?? 'icon'}
      Icon={iconToUse}
      iconColor={iconColorToUse}
      avatarUrl={recordIdentifier?.avatarUrl ?? ''}
      placeholder={labelIdentifier}
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
