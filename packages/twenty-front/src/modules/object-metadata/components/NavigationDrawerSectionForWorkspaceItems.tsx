import { useTheme } from '@emotion/react';
import { Droppable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconPlus } from 'twenty-ui/display';

import { NavigationItemDropTarget } from '@/navigation-menu-item/components/NavigationItemDropTarget';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/hooks/useIsDropDisabledForSection';
import { NavigationSections } from '@/navigation-menu-item/constants/NavigationSections.constants';
import { WorkspaceNavigationMenuItemsFolder } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsFolder';
import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/contexts/NavigationMenuItemDragContext';
import {
  type FlatWorkspaceItem,
  type NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  items: FlatWorkspaceItem[];
  rightIcon?: React.ReactNode;
  onAddMenuItem?: () => void;
  isEditMode?: boolean;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const NavigationDrawerSectionForWorkspaceItems = ({
  sectionTitle,
  items,
  rightIcon,
  onAddMenuItem,
  isEditMode = false,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const workspaceDropDisabled = useIsDropDisabledForSection(true);
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Workspace');
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);
  const coreViews = useRecoilValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { isDragging } = useContext(NavigationMenuItemDragContext);

  const flatItems = items.filter((item) => !isDefined(item.folderId));
  const folderChildrenById = items.reduce<
    Map<string, ProcessedNavigationMenuItem[]>
  >((acc, item) => {
    const folderId = item.folderId;
    if (isDefined(folderId)) {
      const children = acc.get(folderId) ?? [];
      children.push(item as ProcessedNavigationMenuItem);
      acc.set(folderId, children);
    }
    return acc;
  }, new Map());

  const folderCount = flatItems.filter(
    (item) => item.itemType === NavigationMenuItemType.FOLDER,
  ).length;

  const filteredItems = flatItems.filter((item) => {
    const type = item.itemType;
    if (
      type === NavigationMenuItemType.FOLDER ||
      type === NavigationMenuItemType.LINK
    ) {
      return true;
    }
    if (
      type === NavigationMenuItemType.VIEW ||
      type === NavigationMenuItemType.RECORD
    ) {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item as ProcessedNavigationMenuItem,
        objectMetadataItems,
        views,
      );
      return (
        isDefined(objectMetadataItem) &&
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords
      );
    }
    return false;
  });

  const getEditModeProps = (item: FlatWorkspaceItem) => {
    const itemId = item.id;
    return {
      isSelectedInEditMode: selectedNavigationMenuItemId === itemId,
      onEditModeClick: onNavigationMenuItemClick
        ? () => {
            const type = item.itemType;
            const objectMetadataItem =
              type === 'view' || type === 'record'
                ? getObjectMetadataForNavigationMenuItem(
                    item as ProcessedNavigationMenuItem,
                    objectMetadataItems,
                    views,
                  )
                : null;
            onNavigationMenuItemClick({
              item,
              objectMetadataItem: objectMetadataItem ?? undefined,
            });
          }
        : undefined,
    };
  };

  if (flatItems.length === 0) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={sectionTitle}
          onClick={() => toggleNavigationSection()}
          rightIcon={rightIcon}
          alwaysShowRightIcon={isEditMode}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <Droppable
          droppableId={
            NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS
          }
          isDropDisabled={workspaceDropDisabled}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...provided.droppableProps}
            >
              {filteredItems.map((item, index) => {
                const type = item.itemType;
                const editModeProps = getEditModeProps(item);

                if (type === 'folder') {
                  return (
                    <NavigationItemDropTarget
                      key={item.id}
                      folderId={null}
                      index={index}
                      sectionId={NavigationSections.WORKSPACE}
                    >
                      <DraggableItem
                        draggableId={item.id}
                        index={index}
                        isInsideScrollableContainer
                        isDragDisabled={!isEditMode}
                        disableInteractiveElementBlocking={isEditMode}
                        itemComponent={
                          <WorkspaceNavigationMenuItemsFolder
                            folderId={item.id}
                            folderName={item.name ?? 'Folder'}
                            navigationMenuItems={
                              folderChildrenById.get(item.id) ?? []
                            }
                            isGroup={folderCount > 1}
                            isEditMode={isEditMode}
                            isSelectedInEditMode={
                              editModeProps.isSelectedInEditMode
                            }
                            onEditModeClick={editModeProps.onEditModeClick}
                            onNavigationMenuItemClick={
                              onNavigationMenuItemClick
                            }
                            selectedNavigationMenuItemId={
                              selectedNavigationMenuItemId
                            }
                            isDragging={isDragging}
                          />
                        }
                      />
                    </NavigationItemDropTarget>
                  );
                }

                if (type === 'link') {
                  const linkItem = item as ProcessedNavigationMenuItem;
                  const iconColors = getNavigationMenuItemIconColors(theme);
                  return (
                    <NavigationItemDropTarget
                      key={item.id}
                      folderId={null}
                      index={index}
                      sectionId={NavigationSections.WORKSPACE}
                    >
                      <DraggableItem
                        draggableId={item.id}
                        index={index}
                        isInsideScrollableContainer
                        isDragDisabled={!isEditMode}
                        disableInteractiveElementBlocking={isEditMode}
                        itemComponent={
                          <NavigationDrawerItem
                            label={linkItem.labelIdentifier}
                            to={
                              isEditMode || isDragging
                                ? undefined
                                : linkItem.link
                            }
                            onClick={
                              isEditMode
                                ? editModeProps.onEditModeClick
                                : undefined
                            }
                            Icon={IconLink}
                            iconBackgroundColor={iconColors.link}
                            active={false}
                            isSelectedInEditMode={
                              editModeProps.isSelectedInEditMode
                            }
                            isDragging={isDragging}
                            triggerEvent="CLICK"
                          />
                        }
                      />
                    </NavigationItemDropTarget>
                  );
                }

                const objectMetadataItem =
                  getObjectMetadataForNavigationMenuItem(
                    item as ProcessedNavigationMenuItem,
                    objectMetadataItems,
                    views,
                  );
                if (!objectMetadataItem) return null;

                return (
                  <NavigationItemDropTarget
                    key={item.id}
                    folderId={null}
                    index={index}
                    sectionId={NavigationSections.WORKSPACE}
                  >
                    <DraggableItem
                      draggableId={item.id}
                      index={index}
                      isInsideScrollableContainer
                      isDragDisabled={!isEditMode}
                      disableInteractiveElementBlocking={isEditMode}
                      itemComponent={
                        <NavigationDrawerItemForObjectMetadataItem
                          objectMetadataItem={objectMetadataItem}
                          navigationMenuItem={
                            item as ProcessedNavigationMenuItem
                          }
                          isEditMode={isEditMode}
                          isSelectedInEditMode={
                            editModeProps.isSelectedInEditMode
                          }
                          onEditModeClick={editModeProps.onEditModeClick}
                          isDragging={isDragging}
                          onActiveItemClickWhenNotInEditMode={
                            onActiveObjectMetadataItemClick
                              ? () =>
                                  onActiveObjectMetadataItemClick(
                                    objectMetadataItem,
                                    item.id,
                                  )
                              : undefined
                          }
                        />
                      }
                    />
                  </NavigationItemDropTarget>
                );
              })}
              <NavigationItemDropTarget
                folderId={null}
                index={filteredItems.length}
                sectionId={NavigationSections.WORKSPACE}
                compact={!!(isEditMode && onAddMenuItem)}
              >
                {isEditMode && onAddMenuItem && (
                  <NavigationDrawerItem
                    Icon={IconPlus}
                    label={t`Add menu item`}
                    onClick={onAddMenuItem}
                    triggerEvent="CLICK"
                  />
                )}
              </NavigationItemDropTarget>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </NavigationDrawerSection>
  );
};
