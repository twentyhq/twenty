import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React, { useContext, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  useIcons,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/hooks/useOpenAddItemToFolderPage';
import { useWorkspaceFolderOpenState } from '@/navigation-menu-item/hooks/useWorkspaceFolderOpenState';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import {
  FOLDER_HEADER_SLOT_COLLISION_PRIORITY,
  WorkspaceDndKitDroppableSlot,
} from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { WorkspaceNavigationMenuItemFolderSubItem } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemFolderSubItem';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/contexts/SortableDropTargetRefContext';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { getDndKitDropTargetId } from '@/navigation-menu-item/utils/getDndKitDropTargetId';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
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

type WorkspaceNavigationMenuItemsFolderProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: ProcessedNavigationMenuItem[];
  isGroup: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId?: string | null;
  isDragging?: boolean;
};

export const WorkspaceNavigationMenuItemsFolder = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
  isSelectedInEditMode = false,
  onEditModeClick,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId = null,
  isDragging = false,
}: WorkspaceNavigationMenuItemsFolderProps) => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useWorkspaceFolderOpenState({ folderId, navigationMenuItems });
  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );

  const folderContentLengthForTree = isLayoutCustomizationActive
    ? navigationMenuItems.length + 1
    : navigationMenuItems.length;

  const handleAddMenuItemToFolder = () => {
    openAddItemToFolderPage({
      targetFolderId: folderId,
      targetIndex: navigationMenuItems.length,
      resetNavigationStack: true,
    });
  };

  const shouldUseEditModeClick =
    isLayoutCustomizationActive && isDefined(onEditModeClick);
  const handleClick = shouldUseEditModeClick
    ? (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (isSelectedInEditMode) {
          handleToggle();
        } else {
          onEditModeClick?.();
        }
      }
    : handleToggle;

  const [skipInitialExpandAnimation] = useState(() => isOpen);

  const { isDragging: isContextDragging } = useContext(
    NavigationMenuItemDragContext,
  );
  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const folderContentDropDisabled = useIsDropDisabledForSection(true);

  const { activeDropTargetId, forbiddenDropTargetId } = useContext(
    NavigationDropTargetContext,
  );
  const folderHeaderDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${folderId}`;
  const folderContentDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}${folderId}`;
  const folderHeaderSlotId = getDndKitDropTargetId(folderHeaderDroppableId, 0);
  const isForbiddenDropTarget =
    isDefined(forbiddenDropTargetId) &&
    (forbiddenDropTargetId.startsWith(`${folderContentDroppableId}::`) ||
      forbiddenDropTargetId.startsWith(`${folderHeaderDroppableId}::`));
  const isDragOverFolderHeader =
    !isForbiddenDropTarget && activeDropTargetId === folderHeaderSlotId;
  const isCompact =
    isLayoutCustomizationActive || navigationMenuItems.length === 0;

  const headerItem = (
    <NavigationDrawerItem
      label={folderName}
      Icon={FolderIcon}
      iconColor={
        isDefined(folderColor)
          ? folderColor
          : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER
      }
      active={!isOpen && selectedNavigationMenuItemIndex >= 0}
      onClick={handleClick}
      className="navigation-drawer-item"
      triggerEvent="CLICK"
      preventCollapseOnMobile={isMobile}
      isDragging={isDragging}
      alwaysShowRightOptions
      rightOptions={
        <div
          onClick={(e) => {
            e.stopPropagation();
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
      }
    />
  );

  return (
    <StyledFolderContainer
      $isSelectedInEditMode={isSelectedInEditMode}
      data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
      data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
    >
      <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
        <div ref={setSortableDropTargetRef ?? undefined}>
          <WorkspaceDndKitDroppableSlot
            droppableId={folderHeaderDroppableId}
            index={0}
            disabled={folderContentDropDisabled}
            collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
          >
            {headerItem}
          </WorkspaceDndKitDroppableSlot>
        </div>
        <StyledFolderExpandableWrapper>
          <AnimatedExpandableContainer
            isExpanded={isOpen}
            dimension="height"
            mode="fit-content"
            containAnimation
            initial={!skipInitialExpandAnimation}
          >
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
                  <WorkspaceDndKitSortableItem
                    id={navigationMenuItem.id}
                    index={index}
                    group={folderContentDroppableId}
                    disabled={
                      !isLayoutCustomizationActive || folderContentDropDisabled
                    }
                  >
                    <WorkspaceNavigationMenuItemFolderSubItem
                      navigationMenuItem={navigationMenuItem}
                      index={index}
                      arrayLength={folderContentLengthForTree}
                      selectedNavigationMenuItemIndex={
                        selectedNavigationMenuItemIndex
                      }
                      onNavigationMenuItemClick={onNavigationMenuItemClick}
                      selectedNavigationMenuItemId={
                        selectedNavigationMenuItemId ?? null
                      }
                      isContextDragging={isContextDragging}
                    />
                  </WorkspaceDndKitSortableItem>
                </React.Fragment>
              ))}
              <WorkspaceDndKitDroppableSlot
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
                {isLayoutCustomizationActive && (
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
              </WorkspaceDndKitDroppableSlot>
            </StyledFolderDroppableContent>
          </AnimatedExpandableContainer>
        </StyledFolderExpandableWrapper>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
