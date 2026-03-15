import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsSelector } from '@/views/states/selectors/coreViewsSelector';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type WorkspaceNavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: ProcessedNavigationMenuItem;
  index: number;
  arrayLength: number;
  selectedNavigationMenuItemIndex: number;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId: string | null;
  isContextDragging: boolean;
};

export const WorkspaceNavigationMenuItemFolderSubItem = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedNavigationMenuItemIndex,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId,
  isContextDragging,
}: WorkspaceNavigationMenuItemFolderSubItemProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const coreViews = useAtomStateValue(coreViewsSelector);
  const views = coreViews.map(convertCoreViewToView);
  const objectMetadataItem =
    navigationMenuItem.itemType === NavigationMenuItemType.VIEW ||
    navigationMenuItem.itemType === NavigationMenuItemType.RECORD
      ? getObjectMetadataForNavigationMenuItem(
          navigationMenuItem,
          objectMetadataItems,
          views,
        )
      : null;
  const isEditableInEditMode =
    isNavigationMenuInEditMode &&
    isDefined(onNavigationMenuItemClick) &&
    (navigationMenuItem.itemType === NavigationMenuItemType.LINK ||
      isDefined(objectMetadataItem));

  const handleEditModeClick =
    isEditableInEditMode && isDefined(onNavigationMenuItemClick)
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
