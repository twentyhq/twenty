import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemObjectNameSingular = (
  item: NavigationMenuItem,
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular'
  >[],
  views: Pick<View, 'id' | 'objectMetadataId'>[],
): string | undefined => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT:
    case NavigationMenuItemType.RECORD: {
      const objectMetadataItem = objectMetadataItems.find(
        (meta) => meta.id === item.targetObjectMetadataId,
      );
      return objectMetadataItem?.nameSingular;
    }
    case NavigationMenuItemType.VIEW: {
      const view = views.find((view) => view.id === item.viewId);
      if (!isDefined(view)) {
        return undefined;
      }
      const objectMetadataItem = objectMetadataItems.find(
        (meta) => meta.id === view.objectMetadataId,
      );
      return objectMetadataItem?.nameSingular;
    }
    default:
      return undefined;
  }
};
