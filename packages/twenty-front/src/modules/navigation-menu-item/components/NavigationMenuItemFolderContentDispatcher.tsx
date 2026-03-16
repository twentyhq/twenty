import { isDefined } from 'twenty-shared/utils';

import { NavigationMenuItemFolderContent } from '@/navigation-menu-item/components/NavigationMenuItemFolderContent';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';

type NavigationMenuItemFolderContentDispatcherEffectProps = {
  folderName: string;
  folderId: string;
  navigationMenuItems?: ProcessedNavigationMenuItem[];
};

export const NavigationMenuItemFolderContentDispatcherEffect = ({
  folderName,
  folderId,
  navigationMenuItems,
}: NavigationMenuItemFolderContentDispatcherEffectProps) => {
  if (isDefined(navigationMenuItems)) {
    return (
      <NavigationMenuItemFolderContent
        folderId={folderId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
      />
    );
  }

  return null;
};
