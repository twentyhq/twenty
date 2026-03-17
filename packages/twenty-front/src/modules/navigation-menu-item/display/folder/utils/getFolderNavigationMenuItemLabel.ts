import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getFolderNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'name'>,
): string => {
  return item.name ?? 'Folder';
};
