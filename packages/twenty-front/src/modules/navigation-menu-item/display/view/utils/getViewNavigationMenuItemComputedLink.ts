import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getViewNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'viewId'>,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
): string => {
  const view = views.find((view) => view.id === item.viewId);
  if (!isDefined(view)) {
    return '';
  }
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === view.objectMetadataId,
  );
  if (!isDefined(objectMetadataItem)) {
    return '';
  }
  return getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    { viewId: item.viewId! },
  );
};
