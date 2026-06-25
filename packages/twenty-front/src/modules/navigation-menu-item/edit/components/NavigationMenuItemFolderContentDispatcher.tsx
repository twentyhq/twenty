import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemFolderContent } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderContent';

type NavigationMenuItemFolderContentDispatcherEffectProps = {
  folderName: string;
  folderId: string;
  navigationMenuItems?: NavigationMenuItem[];
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
