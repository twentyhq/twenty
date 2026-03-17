import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import React, { lazy, Suspense, useCallback, useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight, IconPlus } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
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
import { NavigationMenuItemFolderFavoritesWrapper } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderFavoritesWrapper';
import { NavigationMenuItemFolderReadOnly } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderReadOnly';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { useNavigationMenuItemFolderOpenState } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemFolderOpenState';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useOpenAddItemToFolderPage } from '@/navigation-menu-item/edit/hooks/useOpenAddItemToFolderPage';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import type { SubItemsRenderParams } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';

const LazyNavigationMenuItemFolder = lazy(() =>
  import(
    '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder'
  ).then((m) => ({ default: m.NavigationMenuItemFolder })),
);

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

type NavigationMenuItemFolderDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemFolderDisplay = ({
  item,
  section,
  editModeProps,
  isDragging,
  folderChildrenById,
  folderCount,
  selectedNavigationMenuItemId,
  onNavigationMenuItemClick,
  readOnly = false,
}: NavigationMenuItemFolderDisplayProps) => {
  const folderId = item.id;
  const folderName = item.name ?? 'Folder';
  const folderIconKey = item.icon;
  const folderColor = 'color' in item ? item.color : undefined;
  const navigationMenuItems = folderChildrenById.get(item.id) ?? [];
  const isGroup = folderCount > 1;

  if (readOnly) {
    return (
      <NavigationMenuItemFolderReadOnly
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
      />
    );
  }

  if (section === NavigationSections.FAVORITES) {
    return (
      <NavigationMenuItemFolderFavoritesWrapper
        folderId={folderId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <NavigationMenuItemFolderReadOnly
          folderId={folderId}
          folderName={folderName}
          folderIconKey={folderIconKey}
          folderColor={folderColor}
          navigationMenuItems={navigationMenuItems}
          isGroup={isGroup}
        />
      }
    >
      <WorkspaceFolderWithEditBehavior
        folderId={folderId}
        folderName={folderName}
        folderIconKey={folderIconKey}
        folderColor={folderColor}
        navigationMenuItems={navigationMenuItems}
        isGroup={isGroup}
        isSelectedInEditMode={editModeProps?.isSelectedInEditMode ?? false}
        onEditModeClick={editModeProps?.onEditModeClick}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        selectedNavigationMenuItemId={selectedNavigationMenuItemId ?? null}
        isDragging={isDragging}
      />
    </Suspense>
  );
};

type WorkspaceFolderWithEditBehaviorProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
  isSelectedInEditMode: boolean;
  onEditModeClick?: () => void;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId: string | null;
  isDragging: boolean;
};

const WorkspaceFolderWithEditBehavior = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
  isSelectedInEditMode,
  onEditModeClick,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId,
  isDragging,
}: WorkspaceFolderWithEditBehaviorProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );

  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useNavigationMenuItemFolderOpenState({ folderId, navigationMenuItems });

  const { openAddItemToFolderPage } = useOpenAddItemToFolderPage();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
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

  const folderContentLengthForTree = isNavigationMenuInEditMode
    ? navigationMenuItems.length + 1
    : navigationMenuItems.length;

  const isCompact =
    isNavigationMenuInEditMode || navigationMenuItems.length === 0;

  const shouldUseEditModeClick =
    isNavigationMenuInEditMode && isDefined(onEditModeClick);

  const handleHeaderClick = shouldUseEditModeClick
    ? (event?: React.MouseEvent) => {
        event?.stopPropagation();
        if (isSelectedInEditMode) {
          handleToggle();
        } else {
          onEditModeClick?.();
        }
      }
    : undefined;

  const handleAddMenuItemToFolder = useCallback(() => {
    openAddItemToFolderPage({
      targetFolderId: folderId,
      targetIndex: navigationMenuItems.length,
      resetNavigationStack: true,
    });
  }, [folderId, navigationMenuItems.length, openAddItemToFolderPage]);

  const chevronRightOptions = (
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

  const renderHeaderWrapper = useCallback(
    (header: React.ReactNode) => (
      <div ref={setSortableDropTargetRef ?? undefined}>
        <NavigationMenuItemDroppableSlot
          droppableId={folderHeaderDroppableId}
          index={0}
          disabled={folderContentDropDisabled}
          collisionPriority={FOLDER_HEADER_SLOT_COLLISION_PRIORITY}
        >
          {header}
        </NavigationMenuItemDroppableSlot>
      </div>
    ),
    [
      setSortableDropTargetRef,
      folderHeaderDroppableId,
      folderContentDropDisabled,
    ],
  );

  const renderSubItems = useCallback(
    ({
      navigationMenuItems: items,
      selectedNavigationMenuItemIndex: selectedIndex,
      isDragging: dragging,
    }: SubItemsRenderParams) => (
      <StyledFolderDroppableContent>
        {items.map((navigationMenuItem, index) => (
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
                navigationMenuItem={navigationMenuItem}
                index={index}
                arrayLength={folderContentLengthForTree}
                selectedNavigationMenuItemIndex={selectedIndex}
                isDragging={dragging}
                onNavigationMenuItemClick={onNavigationMenuItemClick}
                selectedNavigationMenuItemId={selectedNavigationMenuItemId}
              />
            </NavigationMenuItemSortableItem>
          </React.Fragment>
        ))}
        <NavigationMenuItemDroppableSlot
          droppableId={folderContentDroppableId}
          index={items.length}
          disabled={folderContentDropDisabled}
        >
          <NavigationItemDropTarget
            folderId={folderId}
            index={items.length}
            sectionId={NavigationSections.WORKSPACE}
            compact
            dropTargetIdOverride={getDndKitDropTargetId(
              folderContentDroppableId,
              items.length,
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
                index: items.length,
                arrayLength: folderContentLengthForTree,
                selectedIndex: selectedIndex,
              })}
            />
          )}
        </NavigationMenuItemDroppableSlot>
      </StyledFolderDroppableContent>
    ),
    [
      folderId,
      folderContentDroppableId,
      folderContentDropDisabled,
      folderContentLengthForTree,
      isCompact,
      isNavigationMenuInEditMode,
      onNavigationMenuItemClick,
      selectedNavigationMenuItemId,
      sidePanelPage,
      addMenuItemInsertionContext,
      handleAddMenuItemToFolder,
      t,
    ],
  );

  const renderContainer = useCallback(
    (content: React.ReactNode) => (
      <StyledFolderContainer
        $isSelectedInEditMode={isSelectedInEditMode}
        data-drag-over-header={isDragOverFolderHeader ? 'true' : undefined}
        data-forbidden-drop-target={isForbiddenDropTarget ? 'true' : undefined}
      >
        {content}
      </StyledFolderContainer>
    ),
    [isSelectedInEditMode, isDragOverFolderHeader, isForbiddenDropTarget],
  );

  return (
    <LazyNavigationMenuItemFolder
      folderId={folderId}
      folderName={folderName}
      folderIconKey={folderIconKey}
      folderColor={folderColor}
      navigationMenuItems={navigationMenuItems}
      isGroup={isGroup}
      isDragging={isDragging}
      isOpen={isOpen}
      onToggle={handleToggle}
      selectedNavigationMenuItemIndex={selectedNavigationMenuItemIndex}
      headerRightOptions={chevronRightOptions}
      headerActive={!isOpen && selectedNavigationMenuItemIndex >= 0}
      alwaysShowRightOptions
      onHeaderClick={handleHeaderClick}
      renderHeaderWrapper={renderHeaderWrapper}
      renderSubItems={renderSubItems}
      renderContainer={renderContainer}
      containExpandOverflow
    />
  );
};
