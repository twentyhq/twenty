import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React, { Fragment, useCallback, useContext } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconFolder,
  IconHeartOff,
  IconPlus,
  useIcons,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG } from '@/navigation-menu-item/common/constants/NavigationMenuItemSectionDroppableConfig';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/common/contexts/SortableDropTargetRefContext';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import type { NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import {
  FOLDER_HEADER_SLOT_COLLISION_PRIORITY,
  NavigationMenuItemDroppableSlot,
} from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDroppableSlot';
import { NavigationMenuItemInsertBeforeDroppableZone } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemInsertBeforeDroppableZone';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import { NavigationMenuItemFolderLayout } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderLayout';
import { NavigationMenuItemFolderNavigationDrawerItemDropdown } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderNavigationDrawerItemDropdown';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import type { NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useIsNavigationMenuItemEditHighlighted } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemEditHighlighted';
import { useFavoritesFolderEdit } from '@/navigation-menu-item/edit/folder/hooks/useFavoritesFolderEdit';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/edit/hooks/useOpenAddItemToFolderPage';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFolderContainer = styled.div<{
  $isSelectedInEditMode: boolean;
}>`
  border: ${({ $isSelectedInEditMode }) =>
    $isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : 'none'};
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

type NavigationMenuItemFolderDndProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
  isEditInPlace: boolean;
  editModeProps?: EditModeProps;
  isDragging: boolean;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  orphanIndex?: number;
};

export const NavigationMenuItemFolderDnd = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
  isEditInPlace,
  editModeProps,
  isDragging: isDraggingProp,
  onNavigationMenuItemClick,
  orphanIndex,
}: NavigationMenuItemFolderDndProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const isMobile = useIsMobile();

  const section: NavigationMenuItemSection = isEditInPlace
    ? 'favorite'
    : 'workspace';
  const isWorkspace = !isEditInPlace;
  const sectionId = isEditInPlace
    ? NavigationSections.FAVORITES
    : NavigationSections.WORKSPACE;

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  const { isDragging: isContextDragging } = useContext(
    NavigationMenuItemDragContext,
  );
  const isDragging = isDraggingProp || isContextDragging;

  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const dropDisabled = useIsDropDisabledForSection(isWorkspace);
  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );

  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();
  const favoritesEdit = useFavoritesFolderEdit({
    folderId,
    folderName,
    navigationMenuItems,
  });

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();
  const isFolderEditHighlighted = useIsNavigationMenuItemEditHighlighted({
    id: folderId,
    folderId: null,
  });

  const config = NAVIGATION_MENU_ITEM_SECTION_DROPPABLE_CONFIG[section];
  const folderHeaderDroppableId = `${config.folderHeaderPrefix}${folderId}`;
  const folderContentDroppableId = `${config.folderPrefix}${folderId}`;
  const folderHeaderSlotId = getDndKitDropTargetId(folderHeaderDroppableId, 0);

  const isForbiddenDropTarget =
    isDefined(forbiddenDropTargetId) &&
    (forbiddenDropTargetId.startsWith(`${folderContentDroppableId}::`) ||
      forbiddenDropTargetId.startsWith(`${folderHeaderDroppableId}::`));
  const isDragOverFolderHeader =
    !isForbiddenDropTarget && activeDropTargetId === folderHeaderSlotId;

  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const iconColor = isDefined(folderColor)
    ? folderColor
    : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;

  const isSelectedInEditMode = editModeProps?.isSelectedInEditMode ?? false;
  const shouldUseEditModeClick =
    isWorkspace &&
    isLayoutCustomizationModeEnabled &&
    isDefined(editModeProps?.onEditModeClick);

  const handleHeaderClick = shouldUseEditModeClick
    ? (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (isSelectedInEditMode) {
          handleToggle();
        } else {
          editModeProps?.onEditModeClick?.();
        }
      }
    : handleToggle;

  const headerRightOptions = isEditInPlace ? (
    <NavigationMenuItemFolderNavigationDrawerItemDropdown
      folderId={folderId}
      onRename={() => favoritesEdit.setIsRenaming(true)}
      onDelete={favoritesEdit.handleFolderDelete}
      closeDropdown={favoritesEdit.closeDropdown}
    />
  ) : (
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
  );

  const headerOverride =
    isEditInPlace && favoritesEdit.isRenaming ? (
      <NavigationDrawerInput
        Icon={IconFolder}
        value={favoritesEdit.folderNameValue}
        onChange={favoritesEdit.setFolderNameValue}
        onSubmit={favoritesEdit.handleSubmitRename}
        onCancel={favoritesEdit.handleCancelRename}
        onClickOutside={favoritesEdit.handleClickOutsideRename}
      />
    ) : undefined;

  const header = headerOverride ?? (
    <NavigationDrawerItem
      label={folderName}
      Icon={FolderIcon}
      iconColor={iconColor}
      active={
        (!isOpen && selectedNavigationMenuItemIndex >= 0) ||
        (isWorkspace && isSelectedInEditMode && !isOpen)
      }
      onClick={handleHeaderClick}
      rightOptions={headerRightOptions}
      className="navigation-drawer-item"
      isRightOptionsDropdownOpen={
        isEditInPlace ? favoritesEdit.isDropdownOpen : undefined
      }
      triggerEvent="CLICK"
      preventCollapseOnMobile={isMobile}
      isDragging={isDragging}
    />
  );

  const showInsertBeforeZone =
    isDragging && orphanIndex !== undefined && !isEditInPlace;

  const wrappedHeader = (
    <div
      ref={setSortableDropTargetRef ?? undefined}
      style={{ position: 'relative' }}
    >
      {showInsertBeforeZone && (
        <NavigationMenuItemInsertBeforeDroppableZone
          orphanDroppableId={config.orphanDroppableId}
          orphanIndex={orphanIndex}
          itemId={folderId}
          disabled={dropDisabled}
        />
      )}
      <NavigationMenuItemDroppableSlot
        droppableId={folderHeaderDroppableId}
        index={0}
        disabled={dropDisabled}
        collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
      >
        {header}
      </NavigationMenuItemDroppableSlot>
    </div>
  );

  const isCompact = isWorkspace
    ? isLayoutCustomizationModeEnabled || navigationMenuItems.length === 0
    : true;

  const folderContentLength =
    isWorkspace && isLayoutCustomizationModeEnabled
      ? navigationMenuItems.length + 1
      : navigationMenuItems.length;

  const handleAddMenuItemToFolder = useCallback(() => {
    openAddItemToFolderPage({
      folderId,
      position: navigationMenuItems.length,
      resetNavigationStack: true,
    });
  }, [folderId, navigationMenuItems.length, openAddItemToFolderPage]);

  const deleteModal =
    isEditInPlace && favoritesEdit.isModalOpened
      ? createPortal(
          <ConfirmationModal
            modalInstanceId={favoritesEdit.modalId}
            title={
              favoritesEdit.navigationMenuItemCount > 1
                ? t`Remove ${favoritesEdit.navigationMenuItemCount} navigation menu items?`
                : t`Remove ${favoritesEdit.navigationMenuItemCount} navigation menu item?`
            }
            subtitle={
              favoritesEdit.navigationMenuItemCount > 1
                ? t`This action will delete this folder and all ${favoritesEdit.navigationMenuItemCount} navigation menu items inside. Do you want to continue?`
                : t`This action will delete this folder and the navigation menu item inside. Do you want to continue?`
            }
            onConfirmClick={favoritesEdit.handleConfirmDelete}
            confirmButtonText={t`Delete Folder`}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <StyledFolderContainer
        $isSelectedInEditMode={isWorkspace && isFolderEditHighlighted}
        data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
        data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
      >
        <NavigationMenuItemFolderLayout
          header={wrappedHeader}
          isOpen={isOpen}
          isGroup={isGroup}
        >
          <StyledFolderDroppableContent>
            {navigationMenuItems.map((navigationMenuItem, index) => (
              <Fragment key={navigationMenuItem.id}>
                <NavigationItemDropTarget
                  folderId={folderId}
                  index={index}
                  sectionId={sectionId}
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
                    isWorkspace
                      ? !isLayoutCustomizationModeEnabled || dropDisabled
                      : dropDisabled
                  }
                >
                  <NavigationMenuItemFolderSubItem
                    navigationMenuItem={navigationMenuItem}
                    index={index}
                    arrayLength={folderContentLength}
                    selectedNavigationMenuItemIndex={
                      selectedNavigationMenuItemIndex
                    }
                    isDragging={isDragging}
                    rightOptions={
                      isEditInPlace ? (
                        <LightIconButton
                          Icon={IconHeartOff}
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteManyNavigationMenuItems([
                              navigationMenuItem.id,
                            ]);
                          }}
                          accent="tertiary"
                        />
                      ) : undefined
                    }
                    onNavigationMenuItemClick={
                      isWorkspace ? onNavigationMenuItemClick : undefined
                    }
                  />
                </NavigationMenuItemSortableItem>
              </Fragment>
            ))}
            <NavigationMenuItemDroppableSlot
              droppableId={folderContentDroppableId}
              index={navigationMenuItems.length}
              disabled={dropDisabled}
            >
              <NavigationItemDropTarget
                folderId={folderId}
                index={navigationMenuItems.length}
                sectionId={sectionId}
                compact={isCompact}
                dropTargetIdOverride={getDndKitDropTargetId(
                  folderContentDroppableId,
                  navigationMenuItems.length,
                )}
              />
              {isWorkspace && isLayoutCustomizationModeEnabled && (
                <NavigationDrawerSubItem
                  label={t`Add menu item`}
                  Icon={IconPlus}
                  onClick={handleAddMenuItemToFolder}
                  triggerEvent="CLICK"
                  variant="tertiary"
                  isSelectedInEditMode={false}
                  subItemState={getNavigationSubItemLeftAdornment({
                    index: navigationMenuItems.length,
                    arrayLength: folderContentLength,
                    selectedIndex: selectedNavigationMenuItemIndex,
                  })}
                />
              )}
            </NavigationMenuItemDroppableSlot>
          </StyledFolderDroppableContent>
        </NavigationMenuItemFolderLayout>
      </StyledFolderContainer>
      {deleteModal}
    </>
  );
};
