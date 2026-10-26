import { styled } from '@linaria/react';
import React, { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemContainerContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemContainerContext';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';
import { WorkspaceSectionListEditModeFallback } from '@/object-metadata/components/WorkspaceSectionListEditModeFallback';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

const LazyWorkspaceSectionListDndKit = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListDndKit').then(
    (m) => ({ default: m.WorkspaceSectionListDndKit }),
  ),
);

const StyledWorkspaceSectionContentGapOffset = styled.div`
  margin-top: calc(-1 * ${themeCssVariables.betweenSiblingsGap});
`;

type WorkspaceSectionContainerProps = {
  sectionTitle: string;
  items: NavigationMenuItem[];
  containerId?: string | null;
  navigationSectionId?: string;
  isTitleHidden?: boolean;
  rightIcon?: React.ReactNode;
  visibleItemLimit?: number | null;
  isAddMenuItemButtonHidden?: boolean;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const WorkspaceSectionContainer = ({
  sectionTitle,
  items,
  containerId = null,
  navigationSectionId = doNotTranslate('Workspace'),
  isTitleHidden = false,
  rightIcon,
  visibleItemLimit,
  isAddMenuItemButtonHidden = false,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionContainerProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection(navigationSectionId);
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const flatItems = items.filter(
    (item) => (item.folderId ?? null) === containerId,
  );

  const folderChildrenById = items.reduce<Map<string, NavigationMenuItem[]>>(
    (acc, item) => {
      const folderId = item.folderId;
      if (isDefined(folderId) && folderId !== containerId) {
        const children = acc.get(folderId) ?? [];
        children.push(item);
        acc.set(folderId, children);
      }
      return acc;
    },
    new Map(),
  );

  const { filteredTopLevelItems, filteredFolderChildrenById } =
    useReadableNavigationMenuItems({
      topLevelItems: flatItems,
      folderChildrenById,
    });

  const filteredItems = filteredTopLevelItems;

  const {
    visibleItems,
    exceedsVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId,
    items: filteredItems,
    visibleItemLimit,
  });

  const workspaceOrphanItemsForSection = isLayoutCustomizationModeEnabled
    ? flatItems
    : filteredItems;

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

  const list = isLayoutCustomizationModeEnabled ? (
    <Suspense
      fallback={
        <WorkspaceSectionListEditModeFallback
          filteredItems={workspaceOrphanItemsForSection}
          folderChildrenById={folderChildrenById}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          isAddMenuItemButtonHidden={isAddMenuItemButtonHidden}
        />
      }
    >
      <LazyWorkspaceSectionListDndKit
        filteredItems={workspaceOrphanItemsForSection}
        getEditModeProps={getEditModeProps}
        folderChildrenById={folderChildrenById}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
        isAddMenuItemButtonHidden={isAddMenuItemButtonHidden}
      />
    </Suspense>
  ) : (
    <WorkspaceSectionListReadOnly
      filteredItems={visibleItems}
      folderChildrenById={filteredFolderChildrenById}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
      footer={
        exceedsVisibleItemLimit && (
          <NavigationDrawerSectionSeeMoreItem
            isShowingAllItems={isShowingAllItems}
            onClick={toggleShowingAllItems}
          />
        )
      }
    />
  );

  return (
    <NavigationMenuItemContainerContext.Provider value={{ containerId }}>
      {isTitleHidden ? (
        <NavigationDrawerSection>{list}</NavigationDrawerSection>
      ) : (
        <NavigationMenuItemSection
          title={sectionTitle}
          isOpen={isNavigationSectionOpen}
          onToggle={() => toggleNavigationSection()}
          rightIcon={rightIcon}
          alwaysShowRightIcon={isLayoutCustomizationModeEnabled}
          contentWrapper={(children) => (
            <StyledWorkspaceSectionContentGapOffset>
              {children}
            </StyledWorkspaceSectionContentGapOffset>
          )}
        >
          {list}
        </NavigationMenuItemSection>
      )}
    </NavigationMenuItemContainerContext.Provider>
  );
};
