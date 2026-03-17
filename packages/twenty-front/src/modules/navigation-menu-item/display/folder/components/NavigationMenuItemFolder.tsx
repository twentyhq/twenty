import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconFolderOpen,
  IconPlus,
  useIcons,
} from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID } from '@/navigation-menu-item/common/constants/NavigationMenuItemFolderDeleteModalId';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/common/contexts/SortableDropTargetRefContext';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/common/states/addMenuItemInsertionContextState';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import {
  FOLDER_HEADER_SLOT_COLLISION_PRIORITY,
  NavigationMenuItemDroppableSlot,
} from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDroppableSlot';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useDeleteNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useDeleteNavigationMenuItemFolder';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/edit/hooks/useOpenAddItemToFolderPage';
import { useRenameNavigationMenuItemFolder } from '@/navigation-menu-item/edit/folder/hooks/useRenameNavigationMenuItemFolder';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFolderContainer = styled.div<{ $isSelectedInEditMode: boolean }>`
  border: ${({ $isSelectedInEditMode }) =>
    $isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : '1px solid transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  transition: background-color 150ms ease-in-out;

  &[data-drag-over-header='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  &[data-forbidden-drop-target='true'] {
    background-color: ${themeCssVariables.background.transparent.danger};
  }
`;

const StyledFolderDroppableContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFolderExpandableWrapper = styled.div`
  & > div {
    overflow: visible !important;
  }
`;

type NavigationMenuItemFolderProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  section: NavigationSections;
  isGroup: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId?: string | null;
  isDragging?: boolean;
};

export const NavigationMenuItemFolder = ({
  folderId,
  folderName: initialFolderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  section,
  isGroup,
  isSelectedInEditMode = false,
  onEditModeClick,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId = null,
  isDragging: isDraggingProp = false,
}: NavigationMenuItemFolderProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const isFavoritesSection = section === NavigationSections.FAVORITES;
  const isWorkspaceSection = section === NavigationSections.WORKSPACE;

  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  const [isRenaming, setIsRenaming] = useState(false);
  const [folderNameValue, setFolderNameValue] = useState(initialFolderName);
  const { openModal } = useModal();

  const { renameNavigationMenuItemFolder } =
    useRenameNavigationMenuItemFolder();
  const { deleteNavigationMenuItemFolder } =
    useDeleteNavigationMenuItemFolder();
  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );

  const { isDragging: isContextDragging } = useContext(
    NavigationMenuItemDragContext,
  );
  const isDragging = isDraggingProp || isContextDragging;

  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const folderContentDropDisabled = useIsDropDisabledForSection(true);

  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );

  const dropdownId = `navigation-menu-item-folder-edit-${folderId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();

  const modalId = `${NAVIGATION_MENU_ITEM_FOLDER_DELETE_MODAL_ID}-${folderId}`;
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const iconColor = isDefined(folderColor)
    ? folderColor
    : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;

  const folderHeaderDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${folderId}`;
  const folderContentDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}${folderId}`;
  const folderHeaderSlotId = getDndKitDropTargetId(folderHeaderDroppableId, 0);
  const favoritesDroppableId = `folder-${folderId}`;

  const isForbiddenDropTarget =
    isWorkspaceSection &&
    isDefined(forbiddenDropTargetId) &&
    (forbiddenDropTargetId.startsWith(`${folderContentDroppableId}::`) ||
      forbiddenDropTargetId.startsWith(`${folderHeaderDroppableId}::`));
  const isDragOverFolderHeader =
    isWorkspaceSection &&
    !isForbiddenDropTarget &&
    activeDropTargetId === folderHeaderSlotId;

  const folderContentLengthForTree =
    isWorkspaceSection && isNavigationMenuInEditMode
      ? navigationMenuItems.length + 1
      : navigationMenuItems.length;
  const isCompact =
    isWorkspaceSection &&
    (isNavigationMenuInEditMode || navigationMenuItems.length === 0);

  const [skipInitialExpandAnimation] = useState(() => isOpen);

  const handleSubmitRename = async (value: string) => {
    if (value === '') return;
    await renameNavigationMenuItemFolder(folderId, value);
    setIsRenaming(false);
    return true;
  };

  const handleCancelRename = () => {
    setFolderNameValue(initialFolderName);
    setIsRenaming(false);
  };

  const handleClickOutside = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsRenaming(false);
      return;
    }
    await renameNavigationMenuItemFolder(folderId, value);
    setIsRenaming(false);
  };

  const handleFolderDelete = async () => {
    if (navigationMenuItems.length > 0) {
      openModal(modalId);
      closeDropdown(dropdownId);
    } else {
      await deleteNavigationMenuItemFolder(folderId);
      closeDropdown(dropdownId);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteNavigationMenuItemFolder(folderId);
  };

  const handleAddMenuItemToFolder = () => {
    openAddItemToFolderPage({
      targetFolderId: folderId,
      targetIndex: navigationMenuItems.length,
      resetNavigationStack: true,
    });
  };

  const shouldUseEditModeClick =
    isWorkspaceSection &&
    isNavigationMenuInEditMode &&
    isDefined(onEditModeClick);
  const handleClick = shouldUseEditModeClick
    ? (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (isSelectedInEditMode) {
          handleToggle();
        } else {
          onEditModeClick?.();
        }
      }
    : handleToggle;

  const favoritesRightOptions = isFavoritesSection ? (
    <NavigationMenuItemFolderNavigationDrawerItemDropdown
      folderId={folderId}
      onRename={() => setIsRenaming(true)}
      onDelete={handleFolderDelete}
      closeDropdown={() => {
        closeDropdown(dropdownId);
      }}
    />
  ) : undefined;

  const workspaceRightOptions = isWorkspaceSection ? (
    <div
      onClick={(event) => {
        event.stopPropagation();
        handleToggle();
      }}
    >
      {isOpen ? (
        <IconChevronDown
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      ) : (
        <IconChevronRight
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      )}
    </div>
  ) : undefined;

  const headerIcon = isFavoritesSection
    ? isOpen
      ? IconFolderOpen
      : IconFolder
    : FolderIcon;

  const headerItem = (
    <NavigationDrawerItem
      label={isFavoritesSection ? initialFolderName : initialFolderName}
      Icon={headerIcon}
      iconColor={iconColor}
      active={
        isWorkspaceSection
          ? !isOpen && selectedNavigationMenuItemIndex >= 0
          : undefined
      }
      onClick={handleClick}
      rightOptions={
        isFavoritesSection ? favoritesRightOptions : workspaceRightOptions
      }
      className="navigation-drawer-item"
      isRightOptionsDropdownOpen={
        isFavoritesSection ? isDropdownOpen : undefined
      }
      triggerEvent="CLICK"
      preventCollapseOnMobile={isMobile}
      isDragging={isDragging}
      alwaysShowRightOptions={isWorkspaceSection || undefined}
    />
  );

  const renderHeader = () => {
    if (isRenaming) {
      return (
        <NavigationDrawerInput
          Icon={IconFolder}
          value={folderNameValue}
          onChange={setFolderNameValue}
          onSubmit={handleSubmitRename}
          onCancel={handleCancelRename}
          onClickOutside={handleClickOutside}
        />
      );
    }

    if (isWorkspaceSection) {
      return (
        <div ref={setSortableDropTargetRef ?? undefined}>
          <NavigationMenuItemDroppableSlot
            droppableId={folderHeaderDroppableId}
            index={0}
            disabled={folderContentDropDisabled}
            collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
          >
            {headerItem}
          </NavigationMenuItemDroppableSlot>
        </div>
      );
    }

    return (
      <NavigationItemDropTarget
        folderId={folderId}
        index={0}
        sectionId={NavigationSections.FAVORITES}
        dropTargetIdOverride={getDndKitDropTargetId(
          `folder-header-${folderId}`,
          0,
        )}
      >
        {headerItem}
      </NavigationItemDropTarget>
    );
  };

  const renderSubItems = () => {
    if (isWorkspaceSection) {
      return (
        <StyledFolderDroppableContent>
          {navigationMenuItems.map((navigationMenuItem, index) => (
            <React.Fragment key={navigationMenuItem.id}>
              <NavigationItemDropTarget
                folderId={folderId}
                index={index}
                sectionId={NavigationSections.WORKSPACE}
                compact={isCompact}
                dropTargetIdOverride={getDndKitDropTargetId(
                  folderContentDroppableId,
                  index,
                )}
              />
              <NavigationMenuItemSortableItem
                id={navigationMenuItem.id}
                index={index}
                group={folderContentDroppableId}
                disabled={
                  !isNavigationMenuInEditMode || folderContentDropDisabled
                }
              >
                <NavigationMenuItemFolderSubItem
                  section={section}
                  navigationMenuItem={navigationMenuItem}
                  index={index}
                  arrayLength={folderContentLengthForTree}
                  selectedNavigationMenuItemIndex={
                    selectedNavigationMenuItemIndex
                  }
                  isDragging={isContextDragging}
                  onNavigationMenuItemClick={onNavigationMenuItemClick}
                  selectedNavigationMenuItemId={selectedNavigationMenuItemId}
                />
              </NavigationMenuItemSortableItem>
            </React.Fragment>
          ))}
          <NavigationMenuItemDroppableSlot
            droppableId={folderContentDroppableId}
            index={navigationMenuItems.length}
            disabled={folderContentDropDisabled}
          >
            <NavigationItemDropTarget
              folderId={folderId}
              index={navigationMenuItems.length}
              sectionId={NavigationSections.WORKSPACE}
              compact
              dropTargetIdOverride={getDndKitDropTargetId(
                folderContentDroppableId,
                navigationMenuItems.length,
              )}
            />
            {isNavigationMenuInEditMode && (
              <NavigationDrawerSubItem
                label={t`Add menu item`}
                Icon={IconPlus}
                onClick={handleAddMenuItemToFolder}
                triggerEvent="CLICK"
                variant="tertiary"
                isSelectedInEditMode={
                  sidePanelPage === SidePanelPages.NavigationMenuAddItem &&
                  addMenuItemInsertionContext?.targetFolderId === folderId
                }
                subItemState={getNavigationSubItemLeftAdornment({
                  index: navigationMenuItems.length,
                  arrayLength: folderContentLengthForTree,
                  selectedIndex: selectedNavigationMenuItemIndex,
                })}
              />
            )}
          </NavigationMenuItemDroppableSlot>
        </StyledFolderDroppableContent>
      );
    }

    return navigationMenuItems.map((navigationMenuItem, index) => (
      <NavigationMenuItemSortableItem
        key={navigationMenuItem.id}
        id={navigationMenuItem.id}
        index={index}
        group={favoritesDroppableId}
      >
        <NavigationMenuItemFolderSubItem
          section={section}
          navigationMenuItem={navigationMenuItem}
          index={index}
          arrayLength={folderContentLengthForTree}
          selectedNavigationMenuItemIndex={selectedNavigationMenuItemIndex}
          isDragging={isDragging}
        />
      </NavigationMenuItemSortableItem>
    ));
  };

  const navigationMenuItemCount = navigationMenuItems.length;

  const content = (
    <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
      {renderHeader()}
      {isWorkspaceSection ? (
        <StyledFolderExpandableWrapper>
          <AnimatedExpandableContainer
            isExpanded={isOpen}
            dimension="height"
            mode="fit-content"
            containAnimation
            initial={!skipInitialExpandAnimation}
          >
            {renderSubItems()}
          </AnimatedExpandableContainer>
        </StyledFolderExpandableWrapper>
      ) : (
        <AnimatedExpandableContainer
          isExpanded={isOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
        >
          {renderSubItems()}
        </AnimatedExpandableContainer>
      )}
    </NavigationDrawerItemsCollapsableContainer>
  );

  const deleteModal = isModalOpened
    ? createPortal(
        <ConfirmationModal
          modalInstanceId={modalId}
          title={
            navigationMenuItems.length > 1
              ? t`Remove ${navigationMenuItemCount} navigation menu items?`
              : t`Remove ${navigationMenuItemCount} navigation menu item?`
          }
          subtitle={
            navigationMenuItems.length > 1
              ? t`This action will delete this folder and all ${navigationMenuItemCount} navigation menu items inside. Do you want to continue?`
              : t`This action will delete this folder and the navigation menu item inside. Do you want to continue?`
          }
          onConfirmClick={handleConfirmDelete}
          confirmButtonText={t`Delete Folder`}
        />,
        document.body,
      )
    : null;

  if (isWorkspaceSection) {
    return (
      <StyledFolderContainer
        $isSelectedInEditMode={isSelectedInEditMode}
        data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
        data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
      >
        {content}
      </StyledFolderContainer>
    );
  }

  return (
    <>
      {content}
      {deleteModal}
    </>
  );
};
