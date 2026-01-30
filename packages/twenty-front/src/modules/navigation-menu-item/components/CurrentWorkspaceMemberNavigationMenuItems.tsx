import { Droppable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { IconFolder, IconFolderOpen, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationMenuItemDroppable } from '@/navigation-menu-item/components/NavigationMenuItemDroppable';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/constants/NavigationMenuItemFolderDeleteModalId';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItemFolder';
import { useRenameNavigationMenuItemFolder } from '@/navigation-menu-item/hooks/useRenameNavigationMenuItemFolder';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type CurrentWorkspaceMemberNavigationMenuItemsProps = {
  folder: {
    folderId: string;
    folderName: string;
    navigationMenuItems: ProcessedNavigationMenuItem[];
  };
  isGroup: boolean;
};

export const CurrentWorkspaceMemberNavigationMenuItems = ({
  folder,
  isGroup,
}: CurrentWorkspaceMemberNavigationMenuItemsProps) => {
  const { t } = useLingui();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const [
    isNavigationMenuItemFolderRenaming,
    setIsNavigationMenuItemFolderRenaming,
  ] = useState(false);
  const [navigationMenuItemFolderName, setNavigationMenuItemFolderName] =
    useState(folder.folderName);
  const { openModal } = useModal();

  const isMobile = useIsMobile();

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useRecoilState(openNavigationMenuItemFolderIdsState);

  const setCurrentFolderId = useSetRecoilState(
    currentNavigationMenuItemFolderIdState,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folder.folderId);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentFolderId((prev) =>
        prev === folder.folderId ? null : folder.folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) => {
        if (isOpen) {
          return currentOpenFolders.filter((id) => id !== folder.folderId);
        } else {
          return [...currentOpenFolders, folder.folderId];
        }
      });
    }
  };

  const { renameNavigationMenuItemFolder } =
    useRenameNavigationMenuItemFolder();
  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();

  const dropdownId = `navigation-menu-item-folder-edit-${folder.folderId}`;

  const isDropdownOpenComponent = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const selectedNavigationMenuItemIndex = folder.navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const navigationMenuItemFolderContentLength =
    folder.navigationMenuItems.length;

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameNavigationMenuItemFolder(folder.folderId, value);
    setIsNavigationMenuItemFolderRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setNavigationMenuItemFolderName(folder.folderName);
    setIsNavigationMenuItemFolderRenaming(false);
  };

  const handleClickOutside = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsNavigationMenuItemFolderRenaming(false);
      return;
    }

    await renameNavigationMenuItemFolder(folder.folderId, value);
    setIsNavigationMenuItemFolderRenaming(false);
  };

  const modalId = `${NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID}-${folder.folderId}`;

  const handleNavigationMenuItemFolderDelete = async () => {
    if (folder.navigationMenuItems.length > 0) {
      openModal(modalId);
      closeDropdown(dropdownId);
    } else {
      await deleteNavigationMenuItemFolder(folder.folderId);
      closeDropdown(dropdownId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteNavigationMenuItemFolder(folder.folderId);
  };

  const rightOptions = (
    <NavigationMenuItemFolderNavigationDrawerItemDropdown
      folderId={folder.folderId}
      onRename={() => setIsNavigationMenuItemFolderRenaming(true)}
      onDelete={handleNavigationMenuItemFolderDelete}
      closeDropdown={() => {
        closeDropdown(dropdownId);
      }}
    />
  );

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    modalId,
  );

  const navigationMenuItemCount = folder.navigationMenuItems.length;

  return (
    <>
      <NavigationDrawerItemsCollapsableContainer
        key={folder.folderId}
        isGroup={isGroup}
      >
        {isNavigationMenuItemFolderRenaming ? (
          <NavigationDrawerInput
            Icon={IconFolder}
            value={navigationMenuItemFolderName}
            onChange={setNavigationMenuItemFolderName}
            onSubmit={handleSubmitRename}
            onCancel={handleCancelRename}
            onClickOutside={handleClickOutside}
          />
        ) : (
          <NavigationMenuItemDroppable
            droppableId={`folder-header-${folder.folderId}`}
          >
            <NavigationDrawerItem
              label={folder.folderName}
              Icon={isOpen ? IconFolderOpen : IconFolder}
              onClick={handleToggle}
              rightOptions={rightOptions}
              className="navigation-drawer-item"
              isRightOptionsDropdownOpen={isDropdownOpenComponent}
              triggerEvent="CLICK"
              preventCollapseOnMobile={isMobile}
            />
          </NavigationMenuItemDroppable>
        )}

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          <Droppable droppableId={`folder-${folder.folderId}`}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...provided.droppableProps}
              >
                {folder.navigationMenuItems.map((navigationMenuItem, index) => (
                  <DraggableItem
                    key={navigationMenuItem.id}
                    draggableId={navigationMenuItem.id}
                    index={index}
                    isInsideScrollableContainer
                    itemComponent={
                      <NavigationDrawerSubItem
                        secondaryLabel={getNavigationMenuItemSecondaryLabel({
                          objectMetadataItems,
                          navigationMenuItemObjectNameSingular:
                            navigationMenuItem.objectNameSingular,
                        })}
                        label={navigationMenuItem.labelIdentifier}
                        Icon={() => (
                          <NavigationMenuItemIcon
                            navigationMenuItem={navigationMenuItem}
                          />
                        )}
                        to={isDragging ? undefined : navigationMenuItem.link}
                        active={index === selectedNavigationMenuItemIndex}
                        subItemState={getNavigationSubItemLeftAdornment({
                          index,
                          arrayLength: navigationMenuItemFolderContentLength,
                          selectedIndex: selectedNavigationMenuItemIndex,
                        })}
                        rightOptions={
                          <LightIconButton
                            Icon={IconHeartOff}
                            onClick={() =>
                              deleteNavigationMenuItem(navigationMenuItem.id)
                            }
                            accent="tertiary"
                          />
                        }
                        isDragging={isDragging}
                        triggerEvent="CLICK"
                      />
                    }
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>

      {isModalOpened &&
        createPortal(
          <ConfirmationModal
            modalId={modalId}
            title={
              folder.navigationMenuItems.length > 1
                ? t`Remove ${navigationMenuItemCount} navigation menu items?`
                : t`Remove ${navigationMenuItemCount} navigation menu item?`
            }
            subtitle={
              folder.navigationMenuItems.length > 1
                ? t`This action will delete this folder and all ${navigationMenuItemCount} navigation menu items inside. Do you want to continue?`
                : t`This action will delete this folder and the navigation menu item inside. Do you want to continue?`
            }
            onConfirmClick={handleConfirmDelete}
            confirmButtonText={t`Delete Folder`}
          />,
          document.body,
        )}
    </>
  );
};
