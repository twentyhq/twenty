import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type View } from '@/views/types/View';
import { isNonEmptyString } from '@sniptt/guards';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type GetFirstObjectNavigationMenuItemLinkArgs = {
  navigationMenuItemsInDisplayOrder: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[];
  objectPermissionsByObjectMetadataId: Parameters<
    typeof getObjectPermissionsForObject
  >[0];
};

export const getFirstObjectNavigationMenuItemLink = ({
  navigationMenuItemsInDisplayOrder,
  objectMetadataItems,
  views,
  objectPermissionsByObjectMetadataId,
}: GetFirstObjectNavigationMenuItemLinkArgs): string | null => {
  for (const item of navigationMenuItemsInDisplayOrder) {
    if (
      item.type !== NavigationMenuItemType.OBJECT &&
      item.type !== NavigationMenuItemType.VIEW
    ) {
      continue;
    }

    const objectMetadataItem = getObjectMetadataForNavigationMenuItem(
      item,
      objectMetadataItems,
      views,
    );

    if (
      !isDefined(objectMetadataItem) ||
      objectMetadataItem.isSystem ||
      !getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      ).canReadObjectRecords
    ) {
      continue;
    }

    const link = getNavigationMenuItemComputedLink(
      item,
      objectMetadataItems,
      views,
    );

    if (isNonEmptyString(link)) {
      return link;
    }
  }

  return null;
};
