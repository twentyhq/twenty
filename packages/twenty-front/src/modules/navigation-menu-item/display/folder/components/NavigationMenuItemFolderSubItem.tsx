import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
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

type NavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: NavigationMenuItem;
  index: number;
  arrayLength: number;
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
  isDragging,
  rightOptions,
  onClick,
  onNavigationMenuItemClick,
}: NavigationMenuItemFolderSubItemProps) => {
  const isEditHighlightedInNavigationMenu =
    useIsNavigationMenuItemEditHighlighted(navigationMenuItem);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const navigate = useNavigate();
  const setLastClickedNavigationMenuItemId = useSetAtomState(
    lastClickedNavigationMenuItemIdState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  const isActive = activeNavigationMenuItemIds.includes(navigationMenuItem.id);

  const label = getNavigationMenuItemLabel(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const computedLink = getNavigationMenuItemComputedLink(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
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
      to={isDragging || isEditable ? undefined : computedLink}
      onClick={handleClick}
      active={isActive}
      isSelectedInEditMode={isEditHighlightedInNavigationMenu}
      subItemState={getNavigationSubItemLeftAdornment({
        index,
        arrayLength,
        selectedIndex: isActive ? index : -1,
      })}
      rightOptions={rightOptions}
      isDragging={isDragging}
      triggerEvent="CLICK"
    />
  );
};
