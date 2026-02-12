import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/hooks/useNavigationMenuItemsByFolder';

export const useDraftNavigationMenuItemsWorkspaceFolders = () => {
  const { workspaceNavigationMenuItemsByFolder } =
    useNavigationMenuItemsByFolder();

  const workspaceFolders = workspaceNavigationMenuItemsByFolder.map(
    (folder) => ({
      id: folder.id,
      name: folder.folderName,
    }),
  );

  return { workspaceFolders };
};
