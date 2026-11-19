import { lazy, Suspense } from 'react';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { WorkspaceSectionListReadOnly } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListReadOnly';
import { useEditModeNavigationMenuItemClick } from '@/navigation-menu-item/edit/hooks/useEditModeNavigationMenuItemClick';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const LazyWorkspaceSectionListDndKit = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionListDndKit').then(
    (module) => ({ default: module.WorkspaceSectionListDndKit }),
  ),
);

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
    <Suspense
      fallback={
        <WorkspaceSectionListReadOnly
          filteredItems={topLevelItems}
          folderChildrenById={folderChildrenById}
        />
      }
    >
      <LazyWorkspaceSectionListDndKit
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
    </Suspense>
  );
};
