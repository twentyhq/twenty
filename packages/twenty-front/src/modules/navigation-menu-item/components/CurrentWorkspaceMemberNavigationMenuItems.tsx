import { useTheme } from '@emotion/react';
import { Droppable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';

import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconFolder, IconFolderOpen, IconHeartOff } from 'twenty-ui/display';

import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationMenuItemDroppable } from '@/navigation-menu-item/components/NavigationMenuItemDroppable';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/constants/NavigationMenuItemFolderDeleteModalId';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItem';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/hooks/useDeleteNavigationMenuItemFolder';
import { useRenameNavigationMenuItemFolder } from '@/navigation-menu-item/hooks/useRenameNavigationMenuItemFolder';
import { openNavigationMenuItemFolderIdsStateV2 } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
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
import { currentNavigationMenuItemFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type CurrentWorkspaceMemberNavigationMenuItemsProps = {
  folder: {
    id: string;
    folderName: string;
    navigationMenuItems: ProcessedNavigationMenuItem[];
  };
  isGroup: boolean;
  isWorkspaceFolder?: boolean;
};

export const CurrentWorkspaceMemberNavigationMenuItems = ({
  folder,
  isGroup,
  isWorkspaceFolder = false,
}: CurrentWorkspaceMemberNavigationMenuItemsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentViewPath = location.pathname + location.search;
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
    useRecoilStateV2(openNavigationMenuItemFolderIdsStateV2);

  const setCurrentFolderId = useSetRecoilStateV2(
    currentNavigationMenuItemFolderIdStateV2,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folder.id);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentFolderId((prev) => (prev === folder.id ? null : folder.id));
    } else {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) => {
        if (isOpen) {
          return currentOpenFolders.filter((id) => id !== folder.id);
        } else {
          return [...currentOpenFolders, folder.id];
        }
      });
    }

    if (!isOpen) {
      const firstNonLinkItem = folder.navigationMenuItems.find(
        (item) =>
          item.itemType !== NavigationMenuItemType.LINK &&
          isNonEmptyString(item.link),
      );
      if (isDefined(firstNonLinkItem?.link)) {
        navigate(firstNonLinkItem.link);
      }
    }
  };

  const { renameNavigationMenuItemFolder } =
    useRenameNavigationMenuItemFolder();
  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();

  const dropdownId = `navigation-menu-item-folder-edit-${folder.id}`;

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
  const folderContentDropDisabled =
    useIsDropDisabledForSection(isWorkspaceFolder);

  const navigationMenuItemFolderContentLength =
    folder.navigationMenuItems.length;

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameNavigationMenuItemFolder(folder.id, value);
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

    await renameNavigationMenuItemFolder(folder.id, value);
    setIsNavigationMenuItemFolderRenaming(false);
  };

  const modalId = `${NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID}-${folder.id}`;

  const handleNavigationMenuItemFolderDelete = async () => {
    if (folder.navigationMenuItems.length > 0) {
      openModal(modalId);
      closeDropdown(dropdownId);
    } else {
      await deleteNavigationMenuItemFolder(folder.id);
      closeDropdown(dropdownId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteNavigationMenuItemFolder(folder.id);
  };

  const rightOptions = isWorkspaceFolder ? undefined : (
    <NavigationMenuItemFolderNavigationDrawerItemDropdown
      folderId={folder.id}
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
        key={folder.id}
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
            droppableId={`folder-header-${folder.id}`}
            isWorkspaceSection={isWorkspaceFolder}
          >
            <NavigationItemDropTarget
              folderId={folder.id}
              index={0}
              sectionId={
                isWorkspaceFolder
                  ? NavigationSections.WORKSPACE
                  : NavigationSections.FAVORITES
              }
            >
              <NavigationDrawerItem
                label={folder.folderName}
                Icon={isOpen ? IconFolderOpen : IconFolder}
                iconBackgroundColor={iconColors.folder}
                onClick={handleToggle}
                rightOptions={rightOptions}
                className="navigation-drawer-item"
                isRightOptionsDropdownOpen={isDropdownOpenComponent}
                triggerEvent="CLICK"
                preventCollapseOnMobile={isMobile}
              />
            </NavigationItemDropTarget>
          </NavigationMenuItemDroppable>
        )}

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          <Droppable
            droppableId={`folder-${folder.id}`}
            isDropDisabled={folderContentDropDisabled}
          >
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
                          isWorkspaceFolder ? undefined : (
                            <LightIconButton
                              Icon={IconHeartOff}
                              onClick={() =>
                                deleteNavigationMenuItem(navigationMenuItem.id)
                              }
                              accent="tertiary"
                            />
                          )
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
