import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemDescendantIds = (
  items: Pick<NavigationMenuItem, 'id' | 'folderId'>[],
  parentId: string,
): string[] =>
  items
    .filter((item) => item.folderId === parentId)
    .flatMap((child) => [
      child.id,
      ...getNavigationMenuItemDescendantIds(items, child.id),
    ]);
