import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { useConditionalDisplayCurrentUserContext } from '@/conditional-display/hooks/useConditionalDisplayCurrentUserContext';
import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

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
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const currentUserContext = useConditionalDisplayCurrentUserContext();

  const isItemVisibleToCurrentUser = (item: NavigationMenuItem) =>
    isDefined(item.userWorkspaceId) ||
    evaluateConditionalDisplay({
      conditionalDisplay: item.conditionalDisplay,
      context: currentUserContext,
      records: [],
      objectMetadataItems,
    });

  const isItemReadable = (item: NavigationMenuItem) =>
    isNavigationMenuItemReadable({
      item,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    }) && isItemVisibleToCurrentUser(item);

  const filteredFolderChildrenById = new Map<string, NavigationMenuItem[]>();
  for (const [folderId, children] of folderChildrenById) {
    filteredFolderChildrenById.set(folderId, children.filter(isItemReadable));
  }

  const filteredTopLevelItems = topLevelItems.filter((item) =>
    isNavigationMenuItemFolder(item)
      ? isItemVisibleToCurrentUser(item) &&
        (isDefined(item.userWorkspaceId) ||
          (filteredFolderChildrenById.get(item.id) ?? []).length > 0)
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
