import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useIsNavigationMenuItemReadable = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);

  return (item: NavigationMenuItem) =>
    isNavigationMenuItemReadable({
      item,
      permissionFlagMap,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    });
};
