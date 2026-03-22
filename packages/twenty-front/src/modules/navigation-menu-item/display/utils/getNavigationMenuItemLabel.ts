import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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
    case NavigationMenuItemType.OBJECT: {
      const objectMetadataItem = objectMetadataItems.find(
        (meta) => meta.id === item.targetObjectMetadataId,
      );
      return objectMetadataItem?.labelPlural ?? '';
    }
    case NavigationMenuItemType.VIEW: {
      const view = views.find((view) => view.id === item.viewId);
      if (!isDefined(view)) {
        return '';
      }
      if (view.key === ViewKey.INDEX) {
        const objectMetadataItem = objectMetadataItems.find(
          (meta) => meta.id === view.objectMetadataId,
        );
        return objectMetadataItem?.labelPlural ?? view.name;
      }
      return view.name;
    }
    case NavigationMenuItemType.LINK: {
      const linkUrl = (item.link ?? '').trim();
      return (item.name ?? linkUrl) || 'Link';
    }
    case NavigationMenuItemType.RECORD: {
      return item.targetRecordIdentifier?.labelIdentifier ?? '';
    }
    case NavigationMenuItemType.FOLDER: {
      return item.name ?? 'Folder';
    }
    default:
      return item.name ?? '';
  }
};
