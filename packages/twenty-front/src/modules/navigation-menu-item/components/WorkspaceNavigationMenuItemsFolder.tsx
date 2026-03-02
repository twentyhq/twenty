import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  useIcons,
} from 'twenty-ui/display';

import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/hooks/useOpenAddItemToFolderPage';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationMenuItemDroppable } from '@/navigation-menu-item/components/NavigationMenuItemDroppable';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { WorkspaceNavigationMenuItemFolderDragClone } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemFolderDragClone';
import { WorkspaceNavigationMenuItemFolderSubItem } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemFolderSubItem';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/contexts/SortableDropTargetRefContext';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledFolderContainer = styled.div<{ $isSelectedInEditMode: boolean }>`
  border: ${({ theme, $isSelectedInEditMode }) =>
    $isSelectedInEditMode
      ? `1px solid ${theme.color.blue}`
      : '1px solid transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledFolderDroppableContent = styled.div<{
  $compact: boolean;
}>`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme, $compact }) => ($compact ? 0 : theme.spacing(2))};
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
  const useDndKit = useContext(WorkspaceDndKitContext);
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const theme = useTheme();
  const { getIcon } = useIcons();
  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentViewPath = location.pathname + location.search;
  const isMobile = useIsMobile();

  const { t } = useLingui();
  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);

  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );
  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();

  const isOpen = openNavigationMenuItemFolderIds.includes(folderId);

  const folderContentLengthForTree =
    isNavigationMenuInEditMode && isSelectedInEditMode
      ? navigationMenuItems.length + 1
      : navigationMenuItems.length;

  const handleAddMenuItemToFolder = () => {
    openAddItemToFolderPage({
      targetFolderId: folderId,
      targetIndex: navigationMenuItems.length,
      resetNavigationStack: true,
    });
  };

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folderId ? null : folderId,
      );
    } else {
      setOpenNavigationMenuItemFolderIds((current) =>
        isOpen
          ? current.filter((id) => id !== folderId)
          : [...current, folderId],
      );
    }

    if (!isOpen) {
      const firstNonLinkItem = navigationMenuItems.find(
        (item) =>
          item.itemType !== NavigationMenuItemType.LINK &&
          isNonEmptyString(item.link),
      );
      if (isDefined(firstNonLinkItem?.link)) {
        navigate(firstNonLinkItem.link);
      }
    }
  };

  const shouldUseEditModeClick =
    isNavigationMenuInEditMode && isDefined(onEditModeClick);
  const handleClick = shouldUseEditModeClick
    ? (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onEditModeClick?.();
      }
    : handleToggle;

  const selectedNavigationMenuItemIndex = navigationMenuItems.findIndex(
    (item) =>
      isLocationMatchingNavigationMenuItem(currentPath, currentViewPath, item),
  );

  const navigationMenuItemFolderContentLength = navigationMenuItems.length;
  const { isDragging: isContextDragging } = useContext(
    NavigationMenuItemDragContext,
  );
  const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
  const folderContentDropDisabled = useIsDropDisabledForSection(true);

  const folderHeaderDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${folderId}`;
  const folderContentDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}${folderId}`;

  const headerItem = (
    <NavigationDrawerItem
      label={folderName}
      Icon={FolderIcon}
      iconColor={
        isDefined(folderColor)
          ? folderColor
          : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER
      }
      onClick={handleClick}
      className="navigation-drawer-item"
      triggerEvent="CLICK"
      preventCollapseOnMobile={isMobile}
      isDragging={isDragging}
      rightOptions={
        isOpen ? (
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
        )
      }
    />
  );

  if (useDndKit) {
    return (
      <StyledFolderContainer $isSelectedInEditMode={isSelectedInEditMode}>
        <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
          <div ref={setSortableDropTargetRef ?? undefined}>
            <WorkspaceDndKitDroppableSlot
              droppableId={folderHeaderDroppableId}
              index={0}
              disabled={folderContentDropDisabled}
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
            >
              <StyledFolderDroppableContent
                $compact={
                  isNavigationMenuInEditMode || navigationMenuItems.length === 0
                }
                data-dnd-group={folderContentDroppableId}
              >
                {navigationMenuItems.map((navigationMenuItem, index) => (
                  <WorkspaceDndKitSortableItem
                    key={navigationMenuItem.id}
                    id={navigationMenuItem.id}
                    index={index}
                    group={folderContentDroppableId}
                    disabled={
                      !isNavigationMenuInEditMode || folderContentDropDisabled
                    }
                  >
                    <WorkspaceNavigationMenuItemFolderSubItem
                      navigationMenuItem={navigationMenuItem}
                      index={index}
                      arrayLength={navigationMenuItemFolderContentLength}
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
                ))}
                <WorkspaceDndKitDroppableSlot
                  droppableId={folderContentDroppableId}
                  index={navigationMenuItems.length}
                  disabled={folderContentDropDisabled}
                />
              </StyledFolderDroppableContent>
            </AnimatedExpandableContainer>
          </StyledFolderExpandableWrapper>
        </NavigationDrawerItemsCollapsableContainer>
      </StyledFolderContainer>
    );
  }

  return (
    <StyledFolderContainer $isSelectedInEditMode={isSelectedInEditMode}>
      <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
        <NavigationMenuItemDroppable
          droppableId={folderHeaderDroppableId}
          isWorkspaceSection={true}
        >
          {headerItem}
        </NavigationMenuItemDroppable>

        <StyledFolderExpandableWrapper>
          <AnimatedExpandableContainer
            isExpanded={isOpen}
            dimension="height"
            mode="fit-content"
            containAnimation
          >
            <Droppable
              droppableId={folderContentDroppableId}
              isDropDisabled={folderContentDropDisabled}
              ignoreContainerClipping
              renderClone={(provided, snapshot, rubric) => (
                <WorkspaceNavigationMenuItemFolderDragClone
                  draggableProvided={provided}
                  draggableSnapshot={snapshot}
                  rubric={rubric}
                  navigationMenuItems={navigationMenuItems}
                  navigationMenuItemFolderContentLength={
                    navigationMenuItemFolderContentLength
                  }
                  selectedNavigationMenuItemIndex={
                    selectedNavigationMenuItemIndex
                  }
                />
              )}
              getContainerForClone={() => document.body}
            >
              {(provided) => (
                <StyledFolderDroppableContent
                  ref={provided.innerRef}
                  $compact={
                    isNavigationMenuInEditMode ||
                    navigationMenuItems.length === 0
                  }
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                >
                  {navigationMenuItems.map((navigationMenuItem, index) => (
                    <DraggableItem
                      key={navigationMenuItem.id}
                      draggableId={navigationMenuItem.id}
                      index={index}
                      isInsideScrollableContainer
                      isDragDisabled={!isNavigationMenuInEditMode}
                      disableInteractiveElementBlocking={
                        isNavigationMenuInEditMode
                      }
                      itemComponent={
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
                      }
                    />
                  ))}
                  {provided.placeholder}
                </StyledFolderDroppableContent>
              )}
            </Droppable>
            {isNavigationMenuInEditMode && isSelectedInEditMode && (
              <NavigationDrawerSubItem
                label={t`Add menu item`}
                Icon={IconPlus}
                onClick={handleAddMenuItemToFolder}
                triggerEvent="CLICK"
                subItemState={getNavigationSubItemLeftAdornment({
                  index: navigationMenuItems.length,
                  arrayLength: folderContentLengthForTree,
                  selectedIndex: selectedNavigationMenuItemIndex,
                })}
              />
            )}
          </AnimatedExpandableContainer>
        </StyledFolderExpandableWrapper>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
