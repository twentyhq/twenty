import { filterActiveNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterActiveNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemIdsToDeleteOnSave = ({
  workspaceItems,
  draft,
}: {
  workspaceItems: NavigationMenuItem[];
  draft: NavigationMenuItem[];
}): string[] => {
  const draftItemById = new Map(draft.map((item) => [item.id, item]));

  return filterActiveNavigationMenuItems(
    workspaceItems.map((item) => draftItemById.get(item.id) ?? item),
  )
    .filter((item) => !draftItemById.has(item.id))
    .map((item) => item.id);
};
