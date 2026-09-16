import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';

export const useNavigationMenuItemSectionFolders = (
  section: NavigationMenuItemSection,
) => {
  const {
    workspaceNavigationMenuItemsByFolder,
    userNavigationMenuItemsByFolder,
  } = useNavigationMenuItemsByFolder();

  const folders =
    section === 'workspace'
      ? workspaceNavigationMenuItemsByFolder
      : userNavigationMenuItemsByFolder;

  const sectionFolders = folders.map((folder) => ({
    id: folder.id,
    name: folder.folderName,
    icon: folder.icon,
    color: folder.color,
  }));

  return { sectionFolders };
};
