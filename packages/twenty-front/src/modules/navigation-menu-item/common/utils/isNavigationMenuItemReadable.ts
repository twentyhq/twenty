import { PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { hasNativePagePermission } from '@/navigation-menu-item/display/native-page/utils/hasNativePagePermission';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type IsNavigationMenuItemReadableArgs = {
  item: NavigationMenuItem;
  permissionFlagMap: Partial<Record<PermissionFlagType, boolean>>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const isNavigationMenuItemReadable = ({
  item,
  permissionFlagMap,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: IsNavigationMenuItemReadableArgs): boolean => {
  const itemType = item.type;

  if (
    itemType === NavigationMenuItemType.FOLDER ||
    itemType === NavigationMenuItemType.LINK ||
    itemType === NavigationMenuItemType.PAGE_LAYOUT
  ) {
    return true;
  }

  if (itemType === NavigationMenuItemType.WORKFLOW) {
    return permissionFlagMap[PermissionFlagType.WORKFLOWS] ?? false;
  }

  if (itemType === NavigationMenuItemType.AGENT) {
    return permissionFlagMap[PermissionFlagType.AI] ?? false;
  }

  if (itemType === NavigationMenuItemType.NATIVE_PAGE) {
    return hasNativePagePermission({ item, permissionFlagMap });
  }

  if (
    itemType === NavigationMenuItemType.OBJECT ||
    itemType === NavigationMenuItemType.VIEW ||
    itemType === NavigationMenuItemType.RECORD
  ) {
    const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
      item,
      objectMetadataItems,
      views,
    );

    return (
      isDefined(objectMetadataItem) &&
      canAccessThroughAllRecordsOrRlsPermission({
        objectRecordsPermissions: getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ),
        operationType: 'read',
      })
    );
  }

  return false;
};
