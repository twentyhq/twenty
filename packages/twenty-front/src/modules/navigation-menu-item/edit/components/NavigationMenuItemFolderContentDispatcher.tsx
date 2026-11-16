import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemFolderContent } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderContent';

type NavigationMenuItemFolderContentDispatcherEffectProps = {
  folderName: string;
  parentId: string;
  navigationMenuItems?: NavigationMenuItem[];
};

export const NavigationMenuItemFolderContentDispatcherEffect = ({
  folderName,
  parentId,
  navigationMenuItems,
}: NavigationMenuItemFolderContentDispatcherEffectProps) => {
  if (isDefined(navigationMenuItems)) {
    return (
      <NavigationMenuItemFolderContent
        parentId={parentId}
        folderName={folderName}
        navigationMenuItems={navigationMenuItems}
      />
    );
  }

  return null;
};
