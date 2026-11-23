import { isDefined } from 'twenty-shared/utils';

import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { getNavigationMenuItemDescendantIds } from '@/navigation-menu-item/common/utils/getNavigationMenuItemDescendantIds';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getRestoredNavigationMenuItems = ({
  workspaceItems,
  draft,
  navigationMenuItemId,
  fallbackParentId,
}: {
  workspaceItems: NavigationMenuItem[];
  draft: NavigationMenuItem[];
  navigationMenuItemId: string;
  fallbackParentId: string | null;
}): NavigationMenuItem[] => {
  const hiddenItem = workspaceItems.find(
    (item) => item.id === navigationMenuItemId,
  );

  if (!isDefined(hiddenItem)) {
    return [];
  }

  const draftIds = new Set(draft.map((item) => item.id));
  const descendantIds = new Set(
    getNavigationMenuItemDescendantIds({
      items: workspaceItems,
      ancestorId: hiddenItem.id,
    }),
  );
  const isParentInDraft =
    !isDefined(hiddenItem.parentId) || draftIds.has(hiddenItem.parentId);

  return filterActiveNavigationMenuItems([
    {
      ...hiddenItem,
      isActive: true,
      parentId: isParentInDraft ? hiddenItem.parentId : fallbackParentId,
    },
    ...workspaceItems.filter((item) => descendantIds.has(item.id)),
  ]).filter((item) => !draftIds.has(item.id));
};
