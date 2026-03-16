export const isNavigationMenuItemFolder = (item: {
  type?: string | null;
}) => item.type === 'folder';
