import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';

type WorkspaceNavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: ProcessedNavigationMenuItem;
  index: number;
  arrayLength: number;
  selectedNavigationMenuItemIndex: number;
  objectMetadataItems: ObjectMetadataItem[];
  views: View[];
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId: string | null;
  isContextDragging: boolean;
};

export const WorkspaceNavigationMenuItemFolderSubItem = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedNavigationMenuItemIndex,
  objectMetadataItems,
  views,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId,
  isContextDragging,
}: WorkspaceNavigationMenuItemFolderSubItemProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const objectMetadataItem =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW ||
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD
      ? getObjectMetadataForNavigationMenuItem(
          navigationMenuItem,
          objectMetadataItems,
          views,
        )
      : null;
  const handleEditModeClick =
    isNavigationMenuInEditMode &&
    isDefined(onNavigationMenuItemClick) &&
    (navigationMenuItem.itemType === NavigationMenuItemType.LINK ||
      isDefined(objectMetadataItem))
      ? () =>
          onNavigationMenuItemClick({
            item: navigationMenuItem,
            objectMetadataItem: objectMetadataItem ?? undefined,
          })
      : undefined;

  return (
    <NavigationDrawerSubItem
      secondaryLabel={
        navigationMenuItem.viewKey === ViewKey.Index
          ? undefined
          : getNavigationMenuItemSecondaryLabel({
              objectMetadataItems,
              navigationMenuItemObjectNameSingular:
                navigationMenuItem.objectNameSingular,
            })
      }
      label={navigationMenuItem.labelIdentifier}
      Icon={() => (
        <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
      )}
      to={
        isContextDragging || handleEditModeClick
          ? undefined
          : navigationMenuItem.link
      }
      onClick={handleEditModeClick}
      active={index === selectedNavigationMenuItemIndex}
      isSelectedInEditMode={
        selectedNavigationMenuItemId === navigationMenuItem.id
      }
      subItemState={getNavigationSubItemLeftAdornment({
        index,
        arrayLength,
        selectedIndex: selectedNavigationMenuItemIndex,
      })}
      isDragging={isContextDragging}
      triggerEvent="CLICK"
    />
  );
};
