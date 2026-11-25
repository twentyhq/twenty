import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useIsNavigationMenuItemReadable } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemReadable';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseReadableNavigationMenuItemsArgs = {
  topLevelItems: NavigationMenuItem[];
  folderChildrenById: Map<string, NavigationMenuItem[]>;
};

export const useReadableNavigationMenuItems = ({
  topLevelItems,
  folderChildrenById,
}: UseReadableNavigationMenuItemsArgs) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isItemReadable = useIsNavigationMenuItemReadable();

  const filteredFolderChildrenById = new Map<string, NavigationMenuItem[]>();
  for (const [folderId, children] of folderChildrenById) {
    filteredFolderChildrenById.set(folderId, children.filter(isItemReadable));
  }

  const filteredTopLevelItems = topLevelItems.filter((item) =>
    isNavigationMenuItemFolder(item)
      ? isDefined(item.userWorkspaceId) ||
        (filteredFolderChildrenById.get(item.id) ?? []).length > 0
      : isItemReadable(item),
  );

  const displayTopLevelItems = isLayoutCustomizationModeEnabled
    ? topLevelItems
    : filteredTopLevelItems;
  const displayFolderChildrenById = isLayoutCustomizationModeEnabled
    ? folderChildrenById
    : filteredFolderChildrenById;

  return {
    isItemReadable,
    filteredTopLevelItems,
    filteredFolderChildrenById,
    displayTopLevelItems,
    displayFolderChildrenById,
  };
};
