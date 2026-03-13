import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useObjectNavItemColor } from '@/navigation-menu-item/hooks/useObjectNavItemColor';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewKey } from '@/views/types/ViewKey';
import { useLocation } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  navigationMenuItem?: ProcessedNavigationMenuItem;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onActiveItemClickWhenNotInEditMode?: () => void;
  isDragging?: boolean;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
  navigationMenuItem,
  isSelectedInEditMode = false,
  onEditModeClick,
  onActiveItemClickWhenNotInEditMode: _onActiveItemClickWhenNotInEditMode,
  isDragging = false,
}: NavigationDrawerItemForObjectMetadataItemProps) => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const lastVisitedViewId =
    lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id];

  const { getIcon } = useIcons();
  const objectNavItemColor = useObjectNavItemColor(
    objectMetadataItem.nameSingular,
  );
  const location = useLocation();
  const currentPath = location.pathname;
  const currentPathWithSearch = `${location.pathname}${location.search}`;

  const isRecord =
    navigationMenuItem?.itemType === NavigationMenuItemType.RECORD;
  const isView = navigationMenuItem?.itemType === NavigationMenuItemType.VIEW;
  const hasCustomLink = isRecord || isView;

  const navigationPath = hasCustomLink
    ? navigationMenuItem!.link
    : getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
      );

  const isActive = hasCustomLink
    ? (isView ? currentPathWithSearch : currentPath) ===
      navigationMenuItem!.link
    : currentPath ===
        getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: objectMetadataItem.namePlural,
        }) ||
      currentPath.includes(
        getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: objectMetadataItem.nameSingular,
          objectRecordId: '',
        }) + '/',
      );

  const handleClick = isLayoutCustomizationActive ? onEditModeClick : undefined;

  const shouldNavigate = !isLayoutCustomizationActive;

  const isViewWithCustomName =
    isView &&
    navigationMenuItem?.viewKey !== ViewKey.Index &&
    isDefined(navigationMenuItem?.labelIdentifier);

  const label = isRecord
    ? navigationMenuItem!.labelIdentifier
    : isViewWithCustomName
      ? navigationMenuItem!.labelIdentifier
      : objectMetadataItem.labelPlural;

  const Icon = isRecord
    ? () => (
        <Avatar
          type={
            objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
              ? 'squared'
              : 'rounded'
          }
          avatarUrl={navigationMenuItem!.avatarUrl}
          placeholderColorSeed={navigationMenuItem!.targetRecordId ?? undefined}
          placeholder={navigationMenuItem!.labelIdentifier}
        />
      )
    : isViewWithCustomName && isDefined(navigationMenuItem?.Icon)
      ? () => (
          <ObjectIconWithViewOverlay
            ObjectIcon={getIcon(objectMetadataItem.icon)}
            ViewIcon={getIcon(navigationMenuItem!.Icon!)}
            objectColor={objectNavItemColor}
          />
        )
      : getIcon(objectMetadataItem.icon);

  const iconThemeColor = !isRecord
    ? isDefined(navigationMenuItem?.color)
      ? navigationMenuItem.color
      : (getStandardObjectIconColor(objectMetadataItem.nameSingular) ?? 'gray')
    : undefined;

  const secondaryLabel =
    isRecord || isViewWithCustomName
      ? objectMetadataItem.labelSingular
      : undefined;

  return (
    <NavigationDrawerItem
      label={label}
      secondaryLabel={secondaryLabel}
      to={
        isLayoutCustomizationActive || isDragging
          ? undefined
          : shouldNavigate
            ? navigationPath
            : undefined
      }
      onClick={handleClick}
      Icon={Icon}
      iconColor={iconThemeColor}
      active={isActive}
      isSelectedInEditMode={isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent={isLayoutCustomizationActive ? 'CLICK' : undefined}
    />
  );
};
