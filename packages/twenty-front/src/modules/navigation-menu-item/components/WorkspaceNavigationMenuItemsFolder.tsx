import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Droppable } from '@hello-pangea/dnd';
import { isNonEmptyString } from '@sniptt/guards';
import React, { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconChevronDown, IconChevronRight, useIcons } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';

import { NavigationMenuItemDroppable } from '@/navigation-menu-item/components/NavigationMenuItemDroppable';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { WorkspaceDndKitDroppableSlot } from '@/navigation-menu-item/components/WorkspaceDndKitDroppableSlot';
import { WorkspaceDndKitSortableItem } from '@/navigation-menu-item/components/WorkspaceDndKitSortableItem';
import { SortableDropTargetRefContext } from '@/navigation-menu-item/contexts/SortableDropTargetRefContext';
import { WorkspaceNavigationMenuItemFolderDragClone } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemFolderDragClone';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/utils/isLocationMatchingNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { currentNavigationMenuItemFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentNavigationMenuItemFolderIdState';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { coreViewsState } from '@/views/states/coreViewState';
import { ViewKey } from '@/views/types/ViewKey';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  gap: ${({ theme }) => theme.betweenSiblingsGap};
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
  navigationMenuItems: ProcessedNavigationMenuItem[];
  isGroup: boolean;
  isEditMode?: boolean;
  isSelectedInEditMode?: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId?: string | null;
  isDragging?: boolean;
  useDndKit?: boolean;
};

export const WorkspaceNavigationMenuItemsFolder = ({
  folderId,
  folderName,
  folderIconKey,
  navigationMenuItems,
  isGroup,
  isEditMode = false,
  isSelectedInEditMode = false,
  onEditModeClick,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId = null,
  isDragging = false,
  useDndKit = false,
}: WorkspaceNavigationMenuItemsFolderProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const iconColors = getNavigationMenuItemIconColors(theme);
  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const currentViewPath = location.pathname + location.search;
  const isMobile = useIsMobile();

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);

  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const isOpen = openNavigationMenuItemFolderIds.includes(folderId);

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

  const shouldUseEditModeClick = isEditMode && isDefined(onEditModeClick);
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
  const folderContentDropDisabled = useIsDropDisabledForSection(true);

  const folderHeaderDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}${folderId}`;
  const folderContentDroppableId = `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}${folderId}`;

  const headerItem = (
    <NavigationDrawerItem
      label={folderName}
      Icon={FolderIcon}
      iconBackgroundColor={
        isNavigationMenuItemEditingEnabled ? iconColors.folder : undefined
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
    const setSortableDropTargetRef = useContext(SortableDropTargetRefContext);
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
                $compact={isEditMode || navigationMenuItems.length === 0}
                data-dnd-group={folderContentDroppableId}
              >
                {navigationMenuItems.map((navigationMenuItem, index) => {
                  const objectMetadataItem =
                    navigationMenuItem.itemType ===
                      NavigationMenuItemType.VIEW ||
                    navigationMenuItem.itemType ===
                      NavigationMenuItemType.RECORD
                      ? getObjectMetadataForNavigationMenuItem(
                          navigationMenuItem,
                          objectMetadataItems,
                          views,
                        )
                      : null;
                  const handleEditModeClick =
                    isEditMode &&
                    isDefined(onNavigationMenuItemClick) &&
                    (navigationMenuItem.itemType ===
                      NavigationMenuItemType.LINK ||
                      isDefined(objectMetadataItem))
                      ? () =>
                          onNavigationMenuItemClick({
                            item: navigationMenuItem,
                            objectMetadataItem:
                              objectMetadataItem ?? undefined,
                          })
                      : undefined;
                  return (
                    <WorkspaceDndKitSortableItem
                      key={navigationMenuItem.id}
                      id={navigationMenuItem.id}
                      index={index}
                      group={folderContentDroppableId}
                      disabled={!isEditMode || folderContentDropDisabled}
                    >
                      <NavigationDrawerSubItem
                          secondaryLabel={
                            navigationMenuItem.viewKey === ViewKey.Index
                              ? undefined
                              : getNavigationMenuItemSecondaryLabel({
                                  objectMetadataItems,
                                  navigationMenuItemObjectNameSingular:
                                    navigationMenuItem.objectNameSingular,
                                })
                          }
                          label={navigationMenuItem.labelIdentifier}
                          Icon={() => (
                            <NavigationMenuItemIcon
                              navigationMenuItem={navigationMenuItem}
                            />
                          )}
                          to={
                            isContextDragging || handleEditModeClick
                              ? undefined
                              : navigationMenuItem.link
                          }
                          onClick={handleEditModeClick}
                          active={index === selectedNavigationMenuItemIndex}
                          isSelectedInEditMode={
                            selectedNavigationMenuItemId ===
                            navigationMenuItem.id
                          }
                          subItemState={getNavigationSubItemLeftAdornment({
                            index,
                            arrayLength:
                              navigationMenuItemFolderContentLength,
                            selectedIndex: selectedNavigationMenuItemIndex,
                          })}
                          isDragging={isContextDragging}
                          triggerEvent="CLICK"
                        />
                    </WorkspaceDndKitSortableItem>
                  );
                })}
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
              droppableId={`${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}${folderId}`}
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
                  $compact={isEditMode || navigationMenuItems.length === 0}
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...provided.droppableProps}
                >
                  {navigationMenuItems.map((navigationMenuItem, index) => {
                    const objectMetadataItem =
                      navigationMenuItem.itemType ===
                        NavigationMenuItemType.VIEW ||
                      navigationMenuItem.itemType ===
                        NavigationMenuItemType.RECORD
                        ? getObjectMetadataForNavigationMenuItem(
                            navigationMenuItem,
                            objectMetadataItems,
                            views,
                          )
                        : null;
                    const handleEditModeClick =
                      isEditMode &&
                      isDefined(onNavigationMenuItemClick) &&
                      (navigationMenuItem.itemType ===
                        NavigationMenuItemType.LINK ||
                        isDefined(objectMetadataItem))
                        ? () =>
                            onNavigationMenuItemClick({
                              item: navigationMenuItem,
                              objectMetadataItem:
                                objectMetadataItem ?? undefined,
                            })
                        : undefined;

                    return (
                      <DraggableItem
                        key={navigationMenuItem.id}
                        draggableId={navigationMenuItem.id}
                        index={index}
                        isInsideScrollableContainer
                        isDragDisabled={!isEditMode}
                        disableInteractiveElementBlocking={isEditMode}
                        itemComponent={
                          <NavigationDrawerSubItem
                            secondaryLabel={
                              navigationMenuItem.viewKey === ViewKey.Index
                                ? undefined
                                : getNavigationMenuItemSecondaryLabel({
                                    objectMetadataItems,
                                    navigationMenuItemObjectNameSingular:
                                      navigationMenuItem.objectNameSingular,
                                  })
                            }
                            label={navigationMenuItem.labelIdentifier}
                            Icon={() => (
                              <NavigationMenuItemIcon
                                navigationMenuItem={navigationMenuItem}
                              />
                            )}
                            to={
                              isContextDragging || handleEditModeClick
                                ? undefined
                                : navigationMenuItem.link
                            }
                            onClick={handleEditModeClick}
                            active={index === selectedNavigationMenuItemIndex}
                            isSelectedInEditMode={
                              selectedNavigationMenuItemId ===
                              navigationMenuItem.id
                            }
                            subItemState={getNavigationSubItemLeftAdornment({
                              index,
                              arrayLength:
                                navigationMenuItemFolderContentLength,
                              selectedIndex: selectedNavigationMenuItemIndex,
                            })}
                            isDragging={isContextDragging}
                            triggerEvent="CLICK"
                          />
                        }
                      />
                    );
                  })}
                  {provided.placeholder}
                </StyledFolderDroppableContent>
              )}
            </Droppable>
          </AnimatedExpandableContainer>
        </StyledFolderExpandableWrapper>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
