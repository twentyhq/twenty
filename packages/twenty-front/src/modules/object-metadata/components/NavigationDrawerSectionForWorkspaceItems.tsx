import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import {
  type FlatWorkspaceItem,
  type NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { WorkspaceSectionListDndKit } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListDndKit';
import { WorkspaceSectionListHelloPangea } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListHelloPangea';
import { WORKSPACE_ORPHAN_DROPPABLE_ID } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsShared';
import type { EditModeProps } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsTypes';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  items: FlatWorkspaceItem[];
  rightIcon?: React.ReactNode;
  onAddMenuItem?: () => void;
  isEditMode?: boolean;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const NavigationDrawerSectionForWorkspaceItems = ({
  sectionTitle,
  items,
  rightIcon,
  onAddMenuItem,
  isEditMode = false,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const { t } = useLingui();
  const workspaceDropDisabled = useIsDropDisabledForSection(true);
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection('Workspace');
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const theme = useTheme();
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const { addToNavigationFallbackDestination } = useContext(
    NavigationDropTargetContext,
  );
  const isDndKit = useContext(WorkspaceDndKitContext);

  const flatItems = items.filter((item) => !isDefined(item.folderId));
  const isAddToNavigationDropTargetVisible =
    addToNavigationFallbackDestination?.droppableId ===
    WORKSPACE_ORPHAN_DROPPABLE_ID;
  const folderChildrenById = items.reduce<
    Map<string, ProcessedNavigationMenuItem[]>
  >((acc, item) => {
    const folderId = item.folderId;
    if (isDefined(folderId)) {
      const children = acc.get(folderId) ?? [];
      children.push(item as ProcessedNavigationMenuItem);
      acc.set(folderId, children);
    }
    return acc;
  }, new Map());

  const folderCount = flatItems.filter(
    (item) => item.itemType === NavigationMenuItemType.FOLDER,
  ).length;

  const filteredItems = flatItems.filter((item) => {
    const type = item.itemType;
    if (
      type === NavigationMenuItemType.FOLDER ||
      type === NavigationMenuItemType.LINK
    ) {
      return true;
    }
    if (
      type === NavigationMenuItemType.VIEW ||
      type === NavigationMenuItemType.RECORD
    ) {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item as ProcessedNavigationMenuItem,
        objectMetadataItems,
        views,
      );
      return (
        isDefined(objectMetadataItem) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords
      );
    }
    return false;
  });

  const getEditModeProps = (item: FlatWorkspaceItem): EditModeProps => {
    const itemId = item.id;
    return {
      isSelectedInEditMode: selectedNavigationMenuItemId === itemId,
      onEditModeClick: onNavigationMenuItemClick
        ? () => {
            const type = item.itemType;
            const objectMetadataItem =
              type === 'view' || type === 'record'
                ? getObjectMetadataForNavigationMenuItem(
                    item as ProcessedNavigationMenuItem,
                    objectMetadataItems,
                    views,
                  )
                : null;
            onNavigationMenuItemClick({
              item,
              objectMetadataItem: objectMetadataItem ?? undefined,
            });
          }
        : undefined,
    };
  };

  const isAddMenuItemButtonVisible =
    isEditMode && isDefined(onAddMenuItem) && !isDragging;

  if (flatItems.length === 0 && !isAddToNavigationDropTargetVisible) {
    return null;
  }

  const addMenuItemLabel = t`Add menu item`;

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={sectionTitle}
          onClick={() => toggleNavigationSection()}
          rightIcon={rightIcon}
          alwaysShowRightIcon={isEditMode}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {(isNavigationSectionOpen || isAddToNavigationDropTargetVisible) &&
        (isDndKit ? (
          <WorkspaceSectionListDndKit
            filteredItems={filteredItems}
            getEditModeProps={getEditModeProps}
            folderChildrenById={folderChildrenById}
            folderCount={folderCount}
            workspaceDropDisabled={workspaceDropDisabled}
            isEditMode={isEditMode}
            isDragging={isDragging}
            selectedNavigationMenuItemId={selectedNavigationMenuItemId}
            onNavigationMenuItemClick={onNavigationMenuItemClick}
            onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
            objectMetadataItems={objectMetadataItems}
            views={views}
            theme={theme}
            isAddMenuItemButtonVisible={isAddMenuItemButtonVisible}
            addToNavigationFallbackDestination={
              addToNavigationFallbackDestination
            }
            onAddMenuItem={onAddMenuItem}
            addMenuItemLabel={addMenuItemLabel}
          />
        ) : (
          <WorkspaceSectionListHelloPangea
            filteredItems={filteredItems}
            getEditModeProps={getEditModeProps}
            folderChildrenById={folderChildrenById}
            folderCount={folderCount}
            workspaceDropDisabled={workspaceDropDisabled}
            isEditMode={isEditMode}
            isDragging={isDragging}
            selectedNavigationMenuItemId={selectedNavigationMenuItemId}
            onNavigationMenuItemClick={onNavigationMenuItemClick}
            onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
            objectMetadataItems={objectMetadataItems}
            views={views}
            theme={theme}
            isAddMenuItemButtonVisible={isAddMenuItemButtonVisible}
            addToNavigationFallbackDestination={
              addToNavigationFallbackDestination
            }
            onAddMenuItem={onAddMenuItem}
            addMenuItemLabel={addMenuItemLabel}
          />
        ))}
    </NavigationDrawerSection>
  );
};
