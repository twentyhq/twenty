import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getObjectNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'targetObjectMetadataId'>,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  // Kept for the shared dispatcher signature; the link no longer pins a view.
  _views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (!isDefined(objectMetadataItem)) {
    return '';
  }
  // Deliberately NO viewId. Pinning the INDEX view here made this link
  // override every other notion of a default: the record index provider already
  // resolves the view (last visited, then the role default, then INDEX), and an
  // explicit viewId in the URL wins over all of it. Leaving it off is what lets
  // that resolution happen — and it keeps every caller of this util, including
  // the active-state matchers, computing the same link.
  return getAppPath(AppPath.RecordIndexPage, {
    objectNamePlural: objectMetadataItem.namePlural,
  });
};
