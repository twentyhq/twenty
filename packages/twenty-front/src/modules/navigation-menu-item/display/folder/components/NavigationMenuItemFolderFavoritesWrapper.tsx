import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLingui } from '@lingui/react/macro';
import { IconFolder, IconFolderOpen, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import {
  NavigationMenuItemFolder,
  type SubItemsRenderParams,
} from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import { useFavoritesFolderEdit } from '@/navigation-menu-item/edit/folder/hooks/useFavoritesFolderEdit';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';

type NavigationMenuItemFolderFavoritesWrapperProps = {
  folderId: string;
  folderName: string;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
};

export const NavigationMenuItemFolderFavoritesWrapper = ({
  folderId,
  folderName,
  navigationMenuItems,
  isGroup,
}: NavigationMenuItemFolderFavoritesWrapperProps) => {
  const { t } = useLingui();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  const {
    isRenaming,
    setIsRenaming,
    folderNameValue,
    setFolderNameValue,
    handleSubmitRename,
    handleCancelRename,
    handleClickOutsideRename,
    handleFolderDelete,
    handleConfirmDelete,
    isDropdownOpen,
    closeDropdown,
    modalId,
    isModalOpened,
    navigationMenuItemCount,
  } = useFavoritesFolderEdit({ folderId, folderName, navigationMenuItems });

  const headerRightOptions = (
    <NavigationMenuItemFolderNavigationDrawerItemDropdown
      folderId={folderId}
      onRename={() => setIsRenaming(true)}
      onDelete={handleFolderDelete}
      closeDropdown={closeDropdown}
    />
  );

  const headerOverride = isRenaming ? (
    <NavigationDrawerInput
      Icon={IconFolder}
      value={folderNameValue}
      onChange={setFolderNameValue}
      onSubmit={handleSubmitRename}
      onCancel={handleCancelRename}
      onClickOutside={handleClickOutsideRename}
    />
  ) : undefined;

  const renderHeaderWrapper = useCallback(
    (header: React.ReactNode) => (
      <NavigationItemDropTarget
        folderId={folderId}
        index={0}
        sectionId={NavigationSections.FAVORITES}
        dropTargetIdOverride={getDndKitDropTargetId(
          `folder-header-${folderId}`,
          0,
        )}
      >
        {header}
      </NavigationItemDropTarget>
    ),
    [folderId],
  );

  const renderSubItems = useCallback(
    ({
      navigationMenuItems: items,
      selectedNavigationMenuItemIndex: selectedIndex,
      isDragging: dragging,
      folderId: currentFolderId,
    }: SubItemsRenderParams) => {
      const group = `folder-${currentFolderId}`;
      return (
        <>
          {items.map((navigationMenuItem, index) => (
            <React.Fragment key={navigationMenuItem.id}>
              <NavigationItemDropTarget
                folderId={currentFolderId}
                index={index}
                sectionId={NavigationSections.FAVORITES}
                compact
                dropTargetIdOverride={getDndKitDropTargetId(group, index)}
              />
              <NavigationMenuItemSortableItem
                id={navigationMenuItem.id}
                index={index}
                group={group}
              >
                <NavigationMenuItemFolderSubItem
                  navigationMenuItem={navigationMenuItem}
                  index={index}
                  arrayLength={items.length}
                  selectedNavigationMenuItemIndex={selectedIndex}
                  isDragging={dragging}
                  rightOptions={
                    <FavoritesSubItemRemoveButton
                      itemId={navigationMenuItem.id}
                      deleteNavigationMenuItem={deleteNavigationMenuItem}
                    />
                  }
                />
              </NavigationMenuItemSortableItem>
            </React.Fragment>
          ))}
          <NavigationItemDropTarget
            folderId={currentFolderId}
            index={items.length}
            sectionId={NavigationSections.FAVORITES}
            compact
            dropTargetIdOverride={getDndKitDropTargetId(group, items.length)}
          />
        </>
      );
    },
    [deleteNavigationMenuItem],
  );

  const deleteModal = isModalOpened
    ? createPortal(
        <ConfirmationModal
          modalInstanceId={modalId}
          title={
            navigationMenuItemCount > 1
              ? t`Remove ${navigationMenuItemCount} navigation menu items?`
              : t`Remove ${navigationMenuItemCount} navigation menu item?`
          }
          subtitle={
            navigationMenuItemCount > 1
              ? t`This action will delete this folder and all ${navigationMenuItemCount} navigation menu items inside. Do you want to continue?`
              : t`This action will delete this folder and the navigation menu item inside. Do you want to continue?`
          }
          onConfirmClick={handleConfirmDelete}
          confirmButtonText={t`Delete Folder`}
        />,
        document.body,
      )
    : null;

  return (
    <>
      <NavigationMenuItemFolder
        folderId={folderId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
        isOpen={isOpen}
        onToggle={handleToggle}
        selectedNavigationMenuItemIndex={selectedNavigationMenuItemIndex}
        headerIcon={isOpen ? IconFolderOpen : IconFolder}
        headerRightOptions={headerRightOptions}
        isRightOptionsDropdownOpen={isDropdownOpen}
        headerOverride={headerOverride}
        renderHeaderWrapper={renderHeaderWrapper}
        renderSubItems={renderSubItems}
      />
      {deleteModal}
    </>
  );
};

const FavoritesSubItemRemoveButton = ({
  itemId,
  deleteNavigationMenuItem,
}: {
  itemId: string;
  deleteNavigationMenuItem: (id: string) => void;
}) => (
  <LightIconButton
    Icon={IconHeartOff}
    onClick={(event) => {
      event.stopPropagation();
      deleteNavigationMenuItem(itemId);
    }}
    accent="tertiary"
  />
);
