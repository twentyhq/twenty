import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuContainerBlocks } from '@/navigation-menu-item/common/utils/getNavigationMenuContainerBlocks';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { NavigationMenuSectionRenderer } from '@/navigation-menu-item/display/containers/components/NavigationMenuSectionRenderer';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationMenuAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionButton';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuContainerContentProps = {
  containerId: string | null;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};

export const NavigationMenuContainerContent = ({
  containerId,
  onActiveObjectMetadataItemClick,
}: NavigationMenuContainerContentProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { topLevelItems, folderChildrenById } =
    useNavigationMenuContainerItems(containerId);
  const sections = useWorkspaceNavigationMenuContainers({
    type: NavigationMenuItemType.SECTION,
    containerId,
  });
  const sortedChildren = sortNavigationMenuContainerChildren({
    items: topLevelItems,
    sections,
  });

  if (isLayoutCustomizationModeEnabled) {
    return (
      <>
        <NavigationDrawerSection>
          <NavigationMenuContainerEditableItems
            containerId={containerId}
            topLevelItems={sortedChildren}
            folderChildrenById={folderChildrenById}
            renderSection={(section) => (
              <NavigationMenuSectionRenderer section={section} />
            )}
          />
        </NavigationDrawerSection>
        <NavigationMenuAddSectionButton containerId={containerId} />
      </>
    );
  }

  return (
    <>
      {getNavigationMenuContainerBlocks(sortedChildren).map((block) =>
        block.kind === 'section' ? (
          <NavigationMenuSectionRenderer
            key={block.section.id}
            section={block.section}
          />
        ) : (
          <NavigationDrawerSection key={block.items[0].id}>
            <WorkspaceSectionListReadOnly
              filteredItems={block.items}
              folderChildrenById={folderChildrenById}
              onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
            />
          </NavigationDrawerSection>
        ),
      )}
    </>
  );
};
