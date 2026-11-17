import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { WorkspaceSectionListDndKit } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListDndKit';
import { useEditModeNavigationMenuItemClick } from '@/navigation-menu-item/edit/hooks/useEditModeNavigationMenuItemClick';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuContainerEditableItemsProps = {
  containerId: string;
  topLevelItems: NavigationMenuItem[];
  folderChildrenById: Map<string, NavigationMenuItem[]>;
};

export const NavigationMenuContainerEditableItems = ({
  containerId,
  topLevelItems,
  folderChildrenById,
}: NavigationMenuContainerEditableItemsProps) => {
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const handleNavigationMenuItemClick = useEditModeNavigationMenuItemClick();

  return (
    <WorkspaceSectionListDndKit
      containerId={containerId}
      filteredItems={topLevelItems}
      folderChildrenById={folderChildrenById}
      getEditModeProps={(item) => ({
        isSelectedInEditMode:
          selectedNavigationMenuItemIdInEditMode === item.id,
        onEditModeClick: () => handleNavigationMenuItemClick({ item }),
      })}
      onNavigationMenuItemClick={handleNavigationMenuItemClick}
    />
  );
};
