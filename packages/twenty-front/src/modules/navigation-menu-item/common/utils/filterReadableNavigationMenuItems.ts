import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';

type FilterReadableNavigationMenuItemsArgs = {
  navigationMenuItems: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: ViewWithRelations[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const filterReadableNavigationMenuItems = ({
  navigationMenuItems,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: FilterReadableNavigationMenuItemsArgs): NavigationMenuItem[] =>
  navigationMenuItems.filter((item) =>
    isNavigationMenuItemReadable({
      item,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    }),
  );
