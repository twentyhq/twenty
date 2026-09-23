import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemIconWithOverlay } from '@/navigation-menu-item/display/components/NavigationMenuItemIconWithOverlay';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getIconTileColorShades } from 'twenty-ui/components';
import { IconLink, IconPerspective, IconWorld, useIcons } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { LinkIconWithLinkOverlay } from '@/navigation-menu-item/display/link/components/LinkIconWithLinkOverlay';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/display/view/components/ObjectIconWithViewOverlay';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const NavigationMenuItemIcon = ({
  navigationMenuItem,
}: {
  navigationMenuItem: NavigationMenuItem;
}) => {
  const { getIcon } = useIcons();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );

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

  if (navigationMenuItem.type === NavigationMenuItemType.PAGE_LAYOUT) {
    const PageLayoutIcon = isDefined(navigationMenuItem.icon)
      ? getIcon(navigationMenuItem.icon)
      : undefined;
    const pageLayoutColor = getNavigationMenuItemColor(navigationMenuItem);
    const pageLayoutIconStyle = getIconTileColorShades(pageLayoutColor);

    const pageIcon = isDefined(PageLayoutIcon) ? (
      <ColoredIcon Icon={PageLayoutIcon} color={pageLayoutColor} />
    ) : (
      <Avatar
        size="md"
        shape="rounded-square"
        name={navigationMenuItem.name ?? ''}
        color={pageLayoutIconStyle.iconColor}
        backgroundColor={pageLayoutIconStyle.backgroundColor}
      />
    );

    return isLayoutCustomizationModeEnabled ? (
      <NavigationMenuItemIconWithOverlay OverlayIcon={IconPerspective}>
        {pageIcon}
      </NavigationMenuItemIconWithOverlay>
    ) : (
      pageIcon
    );
  }

  if (navigationMenuItem.type === NavigationMenuItemType.LINK) {
    const computedLink = getNavigationMenuItemComputedLink({
      item: navigationMenuItem,
      objectMetadataItems,
      views,
      isInitialObjectViewEnabled,
    });
    return (
      <LinkIconWithLinkOverlay
        link={computedLink}
        LinkIcon={IconLink}
        DefaultIcon={IconWorld}
        color={getNavigationMenuItemColor(navigationMenuItem)}
      />
    );
  }

  if (!isRecord) {
    return <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />;
  }

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

  return (
    <Avatar
      size="md"
      shape={recordIdentifier?.avatarShape ?? 'rounded-square'}
      icon={
        isDefined(StandardIcon) ? (
          <StandardIcon
            color={IconColor ?? themeCssVariables.font.color.secondary}
          />
        ) : undefined
      }
      src={getAbsoluteImageUrl(recordIdentifier?.avatarUrl ?? '')}
      name={labelIdentifier}
      colorSeed={navigationMenuItem.targetRecordId ?? undefined}
    />
  );
};
