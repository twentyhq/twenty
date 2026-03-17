import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconFolderOpen, IconHeartOff } from 'twenty-ui/display';

import { LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/display/dnd/components/WorkspaceDndKitSortableItem';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/common/constants/NavigationMenuItemFolderDeleteModalId';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useDeleteNavigationMenuItemFolder';
import { useRenameNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useRenameNavigationMenuItemFolder';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getEffectiveNavigationMenuItemColor';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';
import { isNonEmptyString } from '@sniptt/guards';

type FavoritesFolderItemProps = {
  folder: {
    id: string;
    folderName: string;
    navigationMenuItems: NavigationMenuItem[];
  };
  isGroup: boolean;
  isWorkspaceFolder?: boolean;
};

export const FavoritesFolderItem = ({
  folder,
  isGroup,
  isWorkspaceFolder = false,
}: FavoritesFolderItemProps) => {
  const { t } = useLingui();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
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
    useAtomState(openNavigationMenuItemFolderIdsState);

  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folder.id);

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folder.id ? null : folder.id,
      );
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
      const firstNonLinkItem = folder.navigationMenuItems.find((item) => {
        if (item.type === NavigationMenuItemType.LINK) {
          return false;
        }
        const computedLink = getNavigationMenuItemComputedLink(
          item,
          objectMetadataItems,
          views,
        );
        return isNonEmptyString(computedLink);
      });
      if (isDefined(firstNonLinkItem)) {
        const link = getNavigationMenuItemComputedLink(
          firstNonLinkItem,
          objectMetadataItems,
          views,
        );
        if (isNonEmptyString(link)) {
          navigate(link);
        }
      }
    }
  };

  const { renameNavigationMenuItemFolder } =
    useRenameNavigationMenuItemFolder();
  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();

  const dropdownId = `navigation-menu-item-folder-edit-${folder.id}`;

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { closeDropdown } = useCloseDropdown();

  const selectedNavigationMenuItemIndex = folder.navigationMenuItems.findIndex(
    (item) => {
      const computedLink = getNavigationMenuItemComputedLink(
        item,
        objectMetadataItems,
        views,
      );
      return isLocationMatchingNavigationMenuItem(
        currentPath,
        currentViewPath,
        item.type,
        computedLink,
      );
    },
  );

  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

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

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  const navigationMenuItemCount = folder.navigationMenuItems.length;

  const folderDroppableId = `folder-${folder.id}`;

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
              iconColor={DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
              onClick={handleToggle}
              rightOptions={rightOptions}
              className="navigation-drawer-item"
              isRightOptionsDropdownOpen={isDropdownOpen}
              triggerEvent="CLICK"
              preventCollapseOnMobile={isMobile}
            />
          </NavigationItemDropTarget>
        )}

        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          {folder.navigationMenuItems.map((navigationMenuItem, index) => {
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
            const view = isDefined(navigationMenuItem.viewId)
              ? views.find((view) => view.id === navigationMenuItem.viewId)
              : undefined;
            const isIndexView = view?.key === ViewKey.INDEX;

            return (
              <WorkspaceDndKitSortableItem
                key={navigationMenuItem.id}
                id={navigationMenuItem.id}
                index={index}
                group={folderDroppableId}
              >
                <NavigationDrawerSubItem
                  secondaryLabel={
                    isIndexView
                      ? undefined
                      : getObjectNavigationMenuItemSecondaryLabel({
                          objectMetadataItems,
                          navigationMenuItemObjectNameSingular:
                            objectNameSingular ?? '',
                        })
                  }
                  label={label}
                  Icon={() => (
                    <NavigationMenuItemIcon
                      navigationMenuItem={navigationMenuItem}
                    />
                  )}
                  to={isDragging ? undefined : computedLink}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNavigationMenuItem(navigationMenuItem.id);
                        }}
                        accent="tertiary"
                      />
                    )
                  }
                  isDragging={isDragging}
                  triggerEvent="CLICK"
                  iconColor={getEffectiveNavigationMenuItemColor(
                    navigationMenuItem,
                  )}
                />
              </WorkspaceDndKitSortableItem>
            );
          })}
        </AnimatedExpandableContainer>
      </NavigationDrawerItemsCollapsableContainer>

      {isModalOpened &&
        createPortal(
          <ConfirmationModal
            modalInstanceId={modalId}
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
