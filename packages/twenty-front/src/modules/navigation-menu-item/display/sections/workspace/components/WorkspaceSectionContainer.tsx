import React, { lazy, Suspense } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useReadableNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useReadableNavigationMenuItems';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { groupNavigationMenuItemsByContainer } from '@/navigation-menu-item/common/utils/groupNavigationMenuItemsByContainer';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { StyledNavigationMenuItemSectionContentGapOffset } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuItemSectionContentGapOffset';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import type { EditModeProps } from '@/object-metadata/components/EditModeProps';
import { WorkspaceSectionListEditModeFallback } from '@/object-metadata/components/WorkspaceSectionListEditModeFallback';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useWorkspaceSidebarRootContainerId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootContainerId';

const LazyWorkspaceSectionListDndKit = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListDndKit').then(
    (m) => ({ default: m.WorkspaceSectionListDndKit }),
  ),
);

type WorkspaceSectionContainerProps = {
  sectionTitle?: string;
  items: NavigationMenuItem[];
  rightIcon?: React.ReactNode;
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
  rightIcon,
  selectedNavigationMenuItemId = null,
  onNavigationMenuItemClick,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionContainerProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { toggleNavigationSection, isNavigationSectionOpen } =
    useNavigationSection(doNotTranslate('Workspace'));
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  // TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
  const workspaceSidebarRootContainerId = useWorkspaceSidebarRootContainerId();
  const { topLevelItems: flatItems, folderChildrenById } =
    groupNavigationMenuItemsByContainer({
      items,
      containerId: workspaceSidebarRootContainerId,
    });

  const { filteredTopLevelItems, filteredFolderChildrenById } =
    useReadableNavigationMenuItems({
      topLevelItems: flatItems,
      folderChildrenById,
    });

  const filteredItems = filteredTopLevelItems;

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
        />
      }
    >
      <LazyWorkspaceSectionListDndKit
        containerId={workspaceSidebarRootContainerId ?? undefined}
        filteredItems={workspaceOrphanItemsForSection}
        getEditModeProps={getEditModeProps}
        folderChildrenById={folderChildrenById}
        onNavigationMenuItemClick={onNavigationMenuItemClick}
        onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
      />
    </Suspense>
  ) : (
    <WorkspaceSectionListReadOnly
      filteredItems={filteredItems}
      folderChildrenById={filteredFolderChildrenById}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );

  const isUntitledListEmpty =
    !isDefined(sectionTitle) &&
    !isLayoutCustomizationModeEnabled &&
    filteredItems.length === 0;

  if (isUntitledListEmpty) {
    return null;
  }

  if (!isDefined(sectionTitle)) {
    return <NavigationDrawerSection>{list}</NavigationDrawerSection>;
  }

  return (
    <NavigationMenuItemSection
      title={sectionTitle}
      isOpen={isNavigationSectionOpen}
      onToggle={() => toggleNavigationSection()}
      rightIcon={rightIcon}
      alwaysShowRightIcon={isLayoutCustomizationModeEnabled}
      contentWrapper={(children) => (
        <StyledNavigationMenuItemSectionContentGapOffset>
          {children}
        </StyledNavigationMenuItemSectionContentGapOffset>
      )}
    >
      {list}
    </NavigationMenuItemSection>
  );
};
