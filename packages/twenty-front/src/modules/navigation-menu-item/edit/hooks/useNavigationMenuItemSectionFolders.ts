import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemSectionFolders = () => {
  const navigationMenuItemEditSection = useAtomStateValue(
    navigationMenuItemEditSectionState,
  );
  const {
    workspaceNavigationMenuItemsByFolder,
    userNavigationMenuItemsByFolder,
  } = useNavigationMenuItemsByFolder();

  const folders =
    navigationMenuItemEditSection === 'workspace'
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
