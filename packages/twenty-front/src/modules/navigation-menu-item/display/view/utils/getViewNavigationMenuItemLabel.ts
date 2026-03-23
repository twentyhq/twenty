import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getViewNavigationMenuItemLabel = (
  item: Pick<NavigationMenuItem, 'viewId'>,
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'key'>[],
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'labelPlural'>[],
): string => {
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
};
