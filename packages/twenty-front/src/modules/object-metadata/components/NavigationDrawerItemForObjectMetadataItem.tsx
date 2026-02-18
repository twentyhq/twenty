import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ObjectIconWithViewOverlay } from '@/navigation-menu-item/components/ObjectIconWithViewOverlay';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { ViewKey } from '@/views/types/ViewKey';
import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Avatar, useIcons } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export type NavigationDrawerItemForObjectMetadataItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  navigationMenuItem?: ProcessedNavigationMenuItem;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onActiveItemClickWhenNotInEditMode?: () => void;
  isDragging?: boolean;
};

export const NavigationDrawerItemForObjectMetadataItem = ({
  objectMetadataItem,
  navigationMenuItem,
  isEditMode = false,
  isSelectedInEditMode = false,
  onEditModeClick,
  onActiveItemClickWhenNotInEditMode,
  isDragging = false,
}: NavigationDrawerItemForObjectMetadataItemProps) => {
  const theme = useTheme();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const iconColors = getNavigationMenuItemIconColors(theme);
  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const views = useRecoilValue(
    coreViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const lastVisitedViewId =
    lastVisitedViewPerObjectMetadataItem?.[objectMetadataItem.id];

  const { getIcon } = useIcons();
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

  const shouldUseClickHandler = isEditMode
    ? Boolean(onEditModeClick)
    : isActive && Boolean(onActiveItemClickWhenNotInEditMode);

  const handleClick = shouldUseClickHandler
    ? isEditMode
      ? onEditModeClick
      : onActiveItemClickWhenNotInEditMode
    : undefined;

  const shouldNavigate =
    !isEditMode && !(isActive && onActiveItemClickWhenNotInEditMode);

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
          />
        )
      : getIcon(objectMetadataItem.icon);

  const iconBackgroundColor =
    isNavigationMenuItemEditingEnabled && !isRecord && !isViewWithCustomName
      ? iconColors.object
      : undefined;

  const secondaryLabel =
    isRecord || isViewWithCustomName
      ? objectMetadataItem.labelSingular
      : undefined;

  const shouldSubItemsBeDisplayed =
    !isNavigationMenuItemEditingEnabled && isActive && views.length > 1;

  const sortedObjectMetadataViews = [...views].sort(
    (viewA, viewB) => viewA.position - viewB.position,
  );

  const selectedSubItemIndex = sortedObjectMetadataViews.findIndex(
    (view) => contextStoreCurrentViewId === view.id,
  );

  const subItemArrayLength = sortedObjectMetadataViews.length;

  if (!isNavigationMenuItemEditingEnabled) {
    return (
      <NavigationDrawerItemsCollapsableContainer
        isGroup={shouldSubItemsBeDisplayed}
      >
        <NavigationDrawerItem
          key={objectMetadataItem.id}
          label={objectMetadataItem.labelPlural}
          to={navigationPath}
          Icon={getIcon(objectMetadataItem.icon)}
          active={isActive}
        />
        <AnimatedExpandableContainer
          isExpanded={shouldSubItemsBeDisplayed}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          {sortedObjectMetadataViews.map((view, index) => (
            <NavigationDrawerSubItem
              label={view.name}
              to={getAppPath(
                AppPath.RecordIndexPage,
                { objectNamePlural: objectMetadataItem.namePlural },
                { viewId: view.id },
              )}
              active={contextStoreCurrentViewId === view.id}
              subItemState={getNavigationSubItemLeftAdornment({
                index,
                arrayLength: subItemArrayLength,
                selectedIndex: selectedSubItemIndex,
              })}
              Icon={getIcon(view.icon)}
              key={view.id}
            />
          ))}
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>
    );
  }

  return (
    <NavigationDrawerItem
      label={label}
      secondaryLabel={secondaryLabel}
      to={
        isEditMode || isDragging
          ? undefined
          : shouldNavigate
            ? navigationPath
            : undefined
      }
      onClick={handleClick}
      Icon={Icon}
      iconBackgroundColor={iconBackgroundColor}
      active={isActive}
      isSelectedInEditMode={isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent={isEditMode ? 'CLICK' : undefined}
    />
  );
};
