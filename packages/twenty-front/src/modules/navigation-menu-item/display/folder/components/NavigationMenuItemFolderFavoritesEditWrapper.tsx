import React, { useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useLingui } from '@lingui/react/macro';
import { IconFolder, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/common/contexts/SortableDropTargetRefContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import {
  FOLDER_HEADER_SLOT_COLLISION_PRIORITY,
  NavigationMenuItemDroppableSlot,
} from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDroppableSlot';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import {
  NavigationMenuItemFolder,
  type SubItemsRenderParams,
} from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';
import {
  StyledFolderContainer,
  StyledFolderDroppableContent,
} from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderDisplay';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import { useFavoritesFolderEdit } from '@/navigation-menu-item/edit/folder/hooks/useFavoritesFolderEdit';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';

type NavigationMenuItemFolderFavoritesEditWrapperProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
};

export const NavigationMenuItemFolderFavoritesEditWrapper = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
}: NavigationMenuItemFolderFavoritesEditWrapperProps) => {
  const { t } = useLingui();
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const favoritesDropDisabled = useIsDropDisabledForSection(false);

  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );

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

  const folderHeaderDroppableId = `folder-header-${folderId}`;
  const folderContentDroppableId = `folder-${folderId}`;
  const folderHeaderSlotId = getDndKitDropTargetId(folderHeaderDroppableId, 0);

  const isForbiddenDropTarget =
    isDefined(forbiddenDropTargetId) &&
    (forbiddenDropTargetId.startsWith(`${folderContentDroppableId}::`) ||
      forbiddenDropTargetId.startsWith(`${folderHeaderDroppableId}::`));
  const isDragOverFolderHeader =
    !isForbiddenDropTarget && activeDropTargetId === folderHeaderSlotId;

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
      <div ref={setSortableDropTargetRef ?? undefined}>
        <NavigationMenuItemDroppableSlot
          droppableId={folderHeaderDroppableId}
          index={0}
          disabled={favoritesDropDisabled}
          collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
        >
          {header}
        </NavigationMenuItemDroppableSlot>
      </div>
    ),
    [setSortableDropTargetRef, folderHeaderDroppableId, favoritesDropDisabled],
  );

  const isCompact = true;

  const renderSubItems = useCallback(
    ({
      navigationMenuItems: items,
      selectedNavigationMenuItemIndex: selectedIndex,
      isDragging: dragging,
      folderId: currentFolderId,
    }: SubItemsRenderParams) => {
      const group = `folder-${currentFolderId}`;
      return (
        <StyledFolderDroppableContent>
          {items.map((navigationMenuItem, index) => (
            <React.Fragment key={navigationMenuItem.id}>
              <NavigationItemDropTarget
                folderId={currentFolderId}
                index={index}
                sectionId={NavigationSections.FAVORITES}
                compact={isCompact}
                dropTargetIdOverride={getDndKitDropTargetId(group, index)}
              />
              <NavigationMenuItemSortableItem
                id={navigationMenuItem.id}
                index={index}
                group={group}
                disabled={favoritesDropDisabled}
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
          <NavigationMenuItemDroppableSlot
            droppableId={group}
            index={items.length}
            disabled={favoritesDropDisabled}
          >
            <NavigationItemDropTarget
              folderId={currentFolderId}
              index={items.length}
              sectionId={NavigationSections.FAVORITES}
              compact
              dropTargetIdOverride={getDndKitDropTargetId(group, items.length)}
            />
          </NavigationMenuItemDroppableSlot>
        </StyledFolderDroppableContent>
      );
    },
    [deleteNavigationMenuItem, favoritesDropDisabled, isCompact],
  );

  const renderContainer = useCallback(
    (content: React.ReactNode) => (
      <StyledFolderContainer
        $isSelectedInEditMode={false}
        data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
        data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
      >
        {content}
      </StyledFolderContainer>
    ),
    [isDragOverFolderHeader, isForbiddenDropTarget],
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
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
        isOpen={isOpen}
        onToggle={handleToggle}
        selectedNavigationMenuItemIndex={selectedNavigationMenuItemIndex}
        headerRightOptions={headerRightOptions}
        headerActive={!isOpen && selectedNavigationMenuItemIndex >= 0}
        alwaysShowRightOptions
        isRightOptionsDropdownOpen={isDropdownOpen}
        headerOverride={headerOverride}
        renderHeaderWrapper={renderHeaderWrapper}
        renderSubItems={renderSubItems}
        renderContainer={renderContainer}
        containExpandOverflow
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
