import { NavigationMenuItemType } from 'twenty-shared/types';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { NavigationMenuContainerEditableItems } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerEditableItems';
import { NavigationMenuSectionRenderer } from '@/navigation-menu-item/display/containers/components/NavigationMenuSectionRenderer';
import { useSelectActiveNavigationMenuItemInEditMode } from '@/navigation-menu-item/display/hooks/useSelectActiveNavigationMenuItemInEditMode';
import { useNavigationMenuContainerItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuContainerItems';
import { useWorkspaceNavigationMenuContainers } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuContainers';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { NavigationMenuAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionButton';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuContainerBlock =
  | { kind: 'items'; items: NavigationMenuItem[] }
  | { kind: 'section'; section: NavigationMenuItem };

const getNavigationMenuContainerBlocks = (
  sortedChildren: NavigationMenuItem[],
): NavigationMenuContainerBlock[] =>
  sortedChildren.reduce<NavigationMenuContainerBlock[]>((blocks, child) => {
    if (child.type === NavigationMenuItemType.SECTION) {
      return [...blocks, { kind: 'section', section: child }];
    }

    const lastBlock = blocks.at(-1);

    if (lastBlock?.kind === 'items') {
      return [
        ...blocks.slice(0, -1),
        { kind: 'items', items: [...lastBlock.items, child] },
      ];
    }

    return [...blocks, { kind: 'items', items: [child] }];
  }, []);

type NavigationMenuContainerContentProps = {
  containerId: string | null;
};

export const NavigationMenuContainerContent = ({
  containerId,
}: NavigationMenuContainerContentProps) => {
  const handleActiveObjectMetadataItemClick =
    useSelectActiveNavigationMenuItemInEditMode();
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
        <NavigationDrawerSection shouldNestedSectionsFillWidth>
          <NavigationMenuContainerEditableItems
            containerId={containerId}
            topLevelItems={sortedChildren}
            folderChildrenById={folderChildrenById}
            renderSection={(section) => (
              <NavigationMenuSectionRenderer section={section} />
            )}
            hasAddItemRow={false}
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
              onActiveObjectMetadataItemClick={
                handleActiveObjectMetadataItemClick
              }
            />
          </NavigationDrawerSection>
        ),
      )}
    </>
  );
};
