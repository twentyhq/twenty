import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { OBJECT_BACKED_NAVIGATION_MENU_ITEM_TYPES } from '@/navigation-menu-item/common/constants/ObjectBackedNavigationMenuItemTypes';
import { isAutomationNavigationMenuItemType } from '@/navigation-menu-item/common/utils/isAutomationNavigationMenuItemType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type View } from '@/views/types/View';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type GetFirstNavigationMenuItemLinkArgs = {
  navigationMenuItemsInDisplayOrder: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key' | 'type' | 'position'>[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const getFirstNavigationMenuItemLink = ({
  navigationMenuItemsInDisplayOrder,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: GetFirstNavigationMenuItemLinkArgs): string | null => {
  for (const item of navigationMenuItemsInDisplayOrder) {
    if (
      item.type === NavigationMenuItemType.FOLDER ||
      item.type === NavigationMenuItemType.LINK ||
      item.type === NavigationMenuItemType.NATIVE_PAGE ||
      isAutomationNavigationMenuItemType(item.type)
    ) {
      continue;
    }

    if (OBJECT_BACKED_NAVIGATION_MENU_ITEM_TYPES.includes(item.type)) {
      const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
        item,
        objectMetadataItems,
        views,
      );

      if (
        !isDefined(objectMetadataItem) ||
        objectMetadataItem.isSystem ||
        !canAccessThroughAllRecordsOrRlsPermission({
          objectRecordsPermissions: getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            objectMetadataItem.id,
          ),
          operationType: 'read',
        })
      ) {
        continue;
      }
    }

    const link = getNavigationMenuItemComputedLink({
      item,
      objectMetadataItems,
      views,
    });

    if (isNonEmptyString(link)) {
      return link;
    }
  }

  return null;
};
