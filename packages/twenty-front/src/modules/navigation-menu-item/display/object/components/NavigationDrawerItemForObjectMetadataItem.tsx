import type { ReactNode } from 'react';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/display/view/components/ObjectIconWithViewOverlay';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLocation } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  navigationMenuItem?: NavigationMenuItem;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onActiveItemClickWhenNotInEditMode?: () => void;
  isDragging?: boolean;
  rightOptions?: ReactNode;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
  navigationMenuItem,
  isSelectedInEditMode = false,
  onEditModeClick,
  onActiveItemClickWhenNotInEditMode: _onActiveItemClickWhenNotInEditMode,
  isDragging = false,
  rightOptions,
}: NavigationDrawerItemForObjectMetadataItemProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const lastVisitedViewId =
    lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id];

  const { getIcon } = useIcons();
  const objectNavItemColor = getObjectColorWithFallback(objectMetadataItem);
  const location = useLocation();
  const currentPath = location.pathname;
  const currentPathWithSearch = `${location.pathname}${location.search}`;

  const isRecord = navigationMenuItem?.type === NavigationMenuItemType.RECORD;
  const isView = navigationMenuItem?.type === NavigationMenuItemType.VIEW;
  const isObject = navigationMenuItem?.type === NavigationMenuItemType.OBJECT;
  const hasCustomLink = isRecord || isView || isObject;

  const navigationPath = hasCustomLink
    ? getNavigationMenuItemComputedLink(
        navigationMenuItem!,
        objectMetadataItems,
        views,
      )
    : getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        lastVisitedViewId ? { viewId: lastVisitedViewId } : undefined,
      );

  const computedLink = hasCustomLink ? navigationPath : '';

  const isActive = hasCustomLink
    ? (isView || isObject ? currentPathWithSearch : currentPath) ===
      computedLink
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

  const handleClick = isLayoutCustomizationModeEnabled
    ? onEditModeClick
    : undefined;

  const shouldNavigate = !isLayoutCustomizationModeEnabled;

  const view = isDefined(navigationMenuItem?.viewId)
    ? views.find((view) => view.id === navigationMenuItem!.viewId)
    : undefined;
  const isViewWithResolvedView = isView && isDefined(view);

  const itemLabel = isDefined(navigationMenuItem)
    ? getNavigationMenuItemLabel(navigationMenuItem, objectMetadataItems, views)
    : objectMetadataItem.labelPlural;

  const label = isRecord
    ? itemLabel
    : isViewWithResolvedView
      ? itemLabel
      : objectMetadataItem.labelPlural;

  const recordIdentifier =
    isRecord && isDefined(navigationMenuItem?.targetRecordIdentifier)
      ? recordIdentifierToObjectRecordIdentifier({
          recordIdentifier: navigationMenuItem!.targetRecordIdentifier!,
          objectMetadataItem,
        })
      : null;

  const Icon = isRecord
    ? () => (
        <Avatar
          type={
            objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
              ? 'squared'
              : 'rounded'
          }
          avatarUrl={recordIdentifier?.avatarUrl}
          placeholderColorSeed={navigationMenuItem!.targetRecordId ?? undefined}
          placeholder={itemLabel}
        />
      )
    : isViewWithResolvedView && isDefined(view?.icon)
      ? () => (
          <ObjectIconWithViewOverlay
            ObjectIcon={getIcon(objectMetadataItem.icon)}
            ViewIcon={getIcon(view!.icon)}
            objectColor={objectNavItemColor}
          />
        )
      : getIcon(objectMetadataItem.icon);

  const iconThemeColor = !isRecord ? objectNavItemColor : undefined;

  const secondaryLabel =
    isRecord || isViewWithResolvedView
      ? objectMetadataItem.labelSingular
      : undefined;

  return (
    <NavigationDrawerItem
      label={label}
      secondaryLabel={secondaryLabel}
      to={
        isLayoutCustomizationModeEnabled || isDragging
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
      triggerEvent={isLayoutCustomizationModeEnabled ? 'CLICK' : undefined}
      rightOptions={rightOptions}
    />
  );
};
