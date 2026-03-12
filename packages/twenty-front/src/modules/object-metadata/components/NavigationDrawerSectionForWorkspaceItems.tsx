import { NavigationDropTargetContext } from '@/navigation-menu-item/contexts/NavigationDropTargetContext';
import React, { lazy, Suspense, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import {
  type FlatWorkspaceItem,
  type NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';
import { NavigationDrawerSectionForWorkspaceItemsListReadOnly } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListReadOnly';
import { WorkspaceSectionListEditModeFallback } from '@/object-metadata/components/WorkspaceSectionListEditModeFallback';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const LazyWorkspaceSectionListDndKit = lazy(() =>
  import(
    '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListDndKit'
  ).then((m) => ({ default: m.WorkspaceSectionListDndKit })),
);

const StyledWorkspaceSectionContentGapOffset = styled.div`
  margin-top: calc(-1 * ${themeCssVariables.betweenSiblingsGap});
`;

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  items: FlatWorkspaceItem[];
  rightIcon?: React.ReactNode;
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
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection('Workspace');
  const coreViews = useAtomStateValue(coreViewsState);
  const views = coreViews.map(convertCoreViewToView);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const { addToNavigationFallbackDestination } = useContext(
    NavigationDropTargetContext,
  );

  const flatItems = items.filter((item) => !isDefined(item.folderId));
  const isAddToNavigationDropTargetVisible =
    addToNavigationFallbackDestination?.droppableId ===
    NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;
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

  const getEditModeProps = (item: FlatWorkspaceItem): EditModeProps => {
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

  if (flatItems.length === 0 && !isAddToNavigationDropTargetVisible) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={sectionTitle}
          onClick={() => toggleNavigationSection()}
          rightIcon={rightIcon}
          alwaysShowRightIcon={isNavigationMenuInEditMode}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <StyledWorkspaceSectionContentGapOffset>
        <AnimatedExpandableContainer
          isExpanded={
            isNavigationSectionOpen || isAddToNavigationDropTargetVisible
          }
          dimension="height"
          mode="fit-content"
          containAnimation
          initial={false}
        >
          {isNavigationMenuInEditMode ? (
            <Suspense
              fallback={
                <WorkspaceSectionListEditModeFallback
                  filteredItems={filteredItems}
                  folderChildrenById={folderChildrenById}
                  onActiveObjectMetadataItemClick={
                    onActiveObjectMetadataItemClick
                  }
                />
              }
            >
              <LazyWorkspaceSectionListDndKit
                filteredItems={filteredItems}
                getEditModeProps={getEditModeProps}
                folderChildrenById={folderChildrenById}
                selectedNavigationMenuItemId={selectedNavigationMenuItemId}
                onNavigationMenuItemClick={onNavigationMenuItemClick}
                onActiveObjectMetadataItemClick={
                  onActiveObjectMetadataItemClick
                }
              />
            </Suspense>
          ) : (
            <NavigationDrawerSectionForWorkspaceItemsListReadOnly
              filteredItems={filteredItems}
              folderChildrenById={folderChildrenById}
              onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
            />
          )}
        </AnimatedExpandableContainer>
      </StyledWorkspaceSectionContentGapOffset>
    </NavigationDrawerSection>
  );
};
