import { navigationMenuItemInsertionPreviewState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionPreviewState';
import { NavigationMenuItemEditable } from '@/navigation-menu-item/edit/components/NavigationMenuItemEditable';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { NavigationMenuItemFolderChevron } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderChevron';
import { NavigationMenuItemFolderChevronButton } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderChevronButton';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React, { Fragment, useContext } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconHeartOff, IconPlus, useIcons } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
import { useIsNavigationMenuItemEditHighlighted } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemEditHighlighted';
import type { NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useFavoritesFolderEdit } from '@/navigation-menu-item/edit/folder/hooks/useFavoritesFolderEdit';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFolderContainer = styled.div<{
  $isSelectedInEditMode: boolean;
}>`
  border-radius: ${themeCssVariables.border.radius.md};
  outline: ${({ $isSelectedInEditMode }) =>
    $isSelectedInEditMode
      ? `1px solid ${themeCssVariables.color.blue}`
      : 'none'};
  outline-offset: -1px;
  transition: background-color 150ms ease-in-out;

  &[data-drag-over-header='true'] {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  &[data-forbidden-drop-target='true'] {
    background-color: ${themeCssVariables.background.transparent.danger};
  }
`;

const StyledAddMenuItem = styled.div<{ isHidden: boolean }>`
  display: ${({ isHidden }) => (isHidden ? 'none' : 'contents')};
`;

const StyledFolderDroppableContent = styled.div`
  display: flex;
  flex-direction: column;
`;

type NavigationMenuItemFolderDndProps = {
  item: NavigationMenuItem;
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
  item,
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
  const { getIcon } = useIcons();
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useAtomStateValue(
    isNavigationDrawerExpandedState,
  );
  const isExpanded = isNavigationDrawerExpanded || isMobile;

  const navigationMenuItemInsertionPreview = useAtomStateValue(
    navigationMenuItemInsertionPreviewState,
  );
  const section: NavigationMenuItemSection = isEditInPlace
    ? 'favorite'
    : 'workspace';
  const insertionIndex =
    navigationMenuItemInsertionPreview?.section === section &&
    navigationMenuItemInsertionPreview.folderId === folderId
      ? navigationMenuItemInsertionPreview.index
      : null;
  const hasInsertionPreview = isDefined(insertionIndex);
  const isAddingFavoriteFolderItem = isEditInPlace && hasInsertionPreview;

  const isWorkspace = !isEditInPlace;
  const sectionId = isEditInPlace
    ? NavigationSections.FAVORITES
    : NavigationSections.WORKSPACE;

  const { isOpen, handleToggle, hasActiveChild, activeChildIndex } =
    useNavigationMenuItemFolderOpenState({
      folderId,
      folderChildrenNavigationMenuItems: navigationMenuItems,
    });

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
    navigationMenuItems,
  });

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
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
      itemCount={navigationMenuItems.length}
      onEdit={favoritesEdit.startEditing}
      onDelete={favoritesEdit.handleFolderDelete}
    />
  ) : (
    <NavigationMenuItemFolderChevron isOpen={isOpen} />
  );

  const header = (
    <NavigationDrawerItem
      label={folderName}
      Icon={() => <ColoredIcon Icon={FolderIcon} color={iconColor} />}
      active={
        (!isOpen && hasActiveChild) ||
        (isWorkspace && isSelectedInEditMode && !isOpen)
      }
      isSelectedInEditMode={
        isWorkspace && isFolderEditHighlighted && !isExpanded
      }
      onClick={handleHeaderClick}
      rightOptions={shouldUseEditModeClick ? undefined : headerRightOptions}
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

  const showAddMenuItem = isEditInPlace
    ? navigationMenuItems.length === 0
    : isLayoutCustomizationModeEnabled;
  const folderContentLength =
    navigationMenuItems.length +
    (showAddMenuItem && !isAddingFavoriteFolderItem ? 1 : 0) +
    (hasInsertionPreview ? 1 : 0);
  const getIndexWithInsertionPreview = (index: number) =>
    isDefined(insertionIndex) && index >= insertionIndex ? index + 1 : index;
  const selectedIndexWithInsertionPreview =
    getIndexWithInsertionPreview(activeChildIndex);
  const getPreviewSubItemState = (index: number) =>
    getNavigationSubItemLeftAdornment({
      index,
      arrayLength: folderContentLength,
      selectedIndex: selectedIndexWithInsertionPreview,
    });

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
        $isSelectedInEditMode={
          isWorkspace && isFolderEditHighlighted && isExpanded
        }
        data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
        data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
      >
        <NavigationMenuItemFolderLayout
          header={
            <NavigationMenuItemEditable
              item={item}
              rightOptions={
                shouldUseEditModeClick &&
                isExpanded && (
                  <NavigationMenuItemFolderChevronButton
                    isOpen={isOpen}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggle();
                    }}
                  />
                )
              }
            >
              {wrappedHeader}
            </NavigationMenuItemEditable>
          }
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
                  previewSubItemState={getPreviewSubItemState(index)}
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
                    index={getIndexWithInsertionPreview(index)}
                    arrayLength={folderContentLength}
                    selectedIndex={selectedIndexWithInsertionPreview}
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
              collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
            >
              <NavigationItemDropTarget
                folderId={folderId}
                index={navigationMenuItems.length}
                sectionId={sectionId}
                compact={isCompact}
                previewSubItemState={getPreviewSubItemState(
                  navigationMenuItems.length,
                )}
                dropTargetIdOverride={getDndKitDropTargetId(
                  folderContentDroppableId,
                  navigationMenuItems.length,
                )}
              />
              {showAddMenuItem && (
                <StyledAddMenuItem isHidden={isAddingFavoriteFolderItem}>
                  <NavigationMenuItemEntrance>
                    <NavigationMenuItemAddDropdown
                      folderId={folderId}
                      section={section}
                      position={navigationMenuItems.length}
                    >
                      <NavigationDrawerSubItem
                        label={t`Add menu item`}
                        Icon={IconPlus}
                        triggerEvent="CLICK"
                        variant="tertiary"
                        isSelectedInEditMode={false}
                        subItemState={getNavigationSubItemLeftAdornment({
                          index: getIndexWithInsertionPreview(
                            navigationMenuItems.length,
                          ),
                          arrayLength: folderContentLength,
                          selectedIndex: -1,
                        })}
                      />
                    </NavigationMenuItemAddDropdown>
                  </NavigationMenuItemEntrance>
                </StyledAddMenuItem>
              )}
            </NavigationMenuItemDroppableSlot>
          </StyledFolderDroppableContent>
        </NavigationMenuItemFolderLayout>
      </StyledFolderContainer>
      {deleteModal}
    </>
  );
};
