import { getFolderNavigationMenuItemLabel } from '@/navigation-menu-item/display/folder/utils/getFolderNavigationMenuItemLabel';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import { getObjectNavigationMenuItemLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemLabel';
import { getRecordNavigationMenuItemLabel } from '@/navigation-menu-item/display/record/utils/getRecordNavigationMenuItemLabel';
import { getViewNavigationMenuItemLabel } from '@/navigation-menu-item/display/view/utils/getViewNavigationMenuItemLabel';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemLabel = (
  item: NavigationMenuItem,
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'labelPlural' | 'nameSingular'
  >[],
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'key'>[],
): string => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT:
      return getObjectNavigationMenuItemLabel(item, objectMetadataItems);
    case NavigationMenuItemType.VIEW:
      return getViewNavigationMenuItemLabel(item, views);
    case NavigationMenuItemType.LINK:
      return getLinkNavigationMenuItemLabel(item);
    case NavigationMenuItemType.RECORD:
      return getRecordNavigationMenuItemLabel(item);
    case NavigationMenuItemType.FOLDER:
      return getFolderNavigationMenuItemLabel(item);
    default:
      return item.name ?? '';
  }
};
