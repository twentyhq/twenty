import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { isNavigationMenuItemSearch } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSearch';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { useIsNavigationMenuItemEditHighlighted } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemEditHighlighted';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import type { EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';

type NavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: NavigationMenuItem;
  index: number;
  arrayLength: number;
  selectedIndex: number;
  isDragging: boolean;
  rightOptions?: ReactNode;
  onClick?: () => void;
  onNavigationMenuItemClick?: (params: {
    item: NavigationMenuItem;
    objectMetadataItem?: EnrichedObjectMetadataItem;
  }) => void;
};

export const NavigationMenuItemFolderSubItem = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedIndex,
  isDragging,
  rightOptions,
  onClick,
  onNavigationMenuItemClick,
}: NavigationMenuItemFolderSubItemProps) => {
  const isEditHighlightedInNavigationMenu =
    useIsNavigationMenuItemEditHighlighted(navigationMenuItem);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const navigate = useNavigate();
  const setLastClickedNavigationMenuItemId = useSetAtomState(
    lastClickedNavigationMenuItemIdState,
  );
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  const isActive = activeNavigationMenuItemIds.includes(navigationMenuItem.id);
  const isSearchNavigationMenuItem =
    isNavigationMenuItemSearch(navigationMenuItem);

  const label = getNavigationMenuItemLabel(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const computedLink = getNavigationMenuItemComputedLink({
    item: navigationMenuItem,
    objectMetadataItems,
    views,
    lastVisitedViewPerObjectMetadataItem,
  });
  const objectNameSingular = getNavigationMenuItemObjectNameSingular(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );

  const objectMetadataItem =
    navigationMenuItem.type === NavigationMenuItemType.OBJECT ||
    navigationMenuItem.type === NavigationMenuItemType.VIEW ||
    navigationMenuItem.type === NavigationMenuItemType.RECORD
      ? getObjectMetadataForNavigationMenuItem(
          navigationMenuItem,
          objectMetadataItems,
          views,
        )
      : null;

  const isEditable =
    isDefined(onNavigationMenuItemClick) &&
    (navigationMenuItem.type === NavigationMenuItemType.LINK ||
      isDefined(objectMetadataItem));

  const handleClick =
    onClick ??
    (isEditable
      ? () =>
          onNavigationMenuItemClick({
            item: navigationMenuItem,
            objectMetadataItem: objectMetadataItem ?? undefined,
          })
      : isSearchNavigationMenuItem
        ? openRecordsSearchPage
        : () => {
            setLastClickedNavigationMenuItemId(navigationMenuItem.id);
            navigate(computedLink);
          });

  return (
    <NavigationDrawerSubItem
      secondaryLabel={
        navigationMenuItem.type !== NavigationMenuItemType.VIEW
          ? undefined
          : getObjectNavigationMenuItemSecondaryLabel({
              objectMetadataItems,
              navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
            })
      }
      label={label}
      Icon={() => (
        <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
      )}
      iconColor={getNavigationMenuItemColor(
        navigationMenuItem,
        objectMetadataItem ?? undefined,
      )}
      to={
        isDragging || isEditable || isSearchNavigationMenuItem
          ? undefined
          : computedLink
      }
      onClick={handleClick}
      active={isActive}
      isSelectedInEditMode={isEditHighlightedInNavigationMenu}
      subItemState={getNavigationSubItemLeftAdornment({
        index,
        arrayLength,
        selectedIndex,
      })}
      rightOptions={rightOptions}
      isDragging={isDragging}
      triggerEvent="CLICK"
    />
  );
};
