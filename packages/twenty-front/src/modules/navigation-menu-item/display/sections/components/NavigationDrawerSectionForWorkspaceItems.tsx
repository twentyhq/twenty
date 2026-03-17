import { NavigationDropTargetContext } from '@/navigation-menu-item/common/contexts/NavigationDropTargetContext';
import React, { lazy, Suspense, useContext } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';
import { NavigationDrawerSectionForWorkspaceItemsListReadOnly } from '@/navigation-menu-item/display/sections/components/NavigationDrawerSectionForWorkspaceItemsListReadOnly';
import { WorkspaceSectionListEditModeFallback } from '@/object-metadata/components/WorkspaceSectionListEditModeFallback';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const LazyWorkspaceSectionListDndKit = lazy(() =>
  import(
    '@/navigation-menu-item/display/sections/components/NavigationDrawerSectionForWorkspaceItemsListDndKit'
  ).then((m) => ({ default: m.WorkspaceSectionListDndKit })),
);

const StyledWorkspaceSectionContentGapOffset = styled.div`
  margin-top: calc(-1 * ${themeCssVariables.betweenSiblingsGap});
`;

type NavigationDrawerSectionForWorkspaceItemsProps = {
  sectionTitle: string;
  items: NavigationMenuItem[];
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
  const views = useAtomStateValue(viewsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { addToNavigationFallbackDestination } = useContext(
    NavigationDropTargetContext,
  );

  const flatItems = items.filter((item) => !isDefined(item.folderId));
  const isAddToNavigationDropTargetVisible =
    addToNavigationFallbackDestination?.droppableId ===
    NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;
  const folderChildrenById = items.reduce<Map<string, NavigationMenuItem[]>>(
    (acc, item) => {
      const folderId = item.folderId;
      if (isDefined(folderId)) {
        const children = acc.get(folderId) ?? [];
        children.push(item);
        acc.set(folderId, children);
      }
      return acc;
    },
    new Map(),
  );

  const filteredItems = flatItems.filter((item) => {
    const itemType = item.type;
    if (
      itemType === NavigationMenuItemType.FOLDER ||
      itemType === NavigationMenuItemType.LINK
    ) {
      return true;
    }
    if (
      itemType === NavigationMenuItemType.OBJECT ||
      itemType === NavigationMenuItemType.VIEW ||
      itemType === NavigationMenuItemType.RECORD
    ) {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item,
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

  const getEditModeProps = (item: NavigationMenuItem): EditModeProps => {
    const itemId = item.id;
    return {
      isSelectedInEditMode: selectedNavigationMenuItemId === itemId,
      onEditModeClick: onNavigationMenuItemClick
        ? () => {
            const itemType = item.type;
            const objectMetadataItem =
              itemType === 'OBJECT' ||
              itemType === 'VIEW' ||
              itemType === 'RECORD'
                ? getObjectMetadataForNavigationMenuItem(
                    item,
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
