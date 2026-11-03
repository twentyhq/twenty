import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getCoreObjectIndexPagePath } from '@/object-core/utils/getCoreObjectIndexPagePath';
import { type View } from '@/views/types/View';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getViewNavigationMenuItemComputedLink = ({
  item,
  objectMetadataItems,
  views,
}: {
  item: Pick<NavigationMenuItem, 'viewId'>;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'namePlural'>[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[];
}): string => {
  const view = views.find((view) => view.id === item.viewId);

  if (!isDefined(view)) {
    return '';
  }

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === view.objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return '';
  }

  const coreObjectIndexPagePath = getCoreObjectIndexPagePath(
    objectMetadataItem.namePlural,
  );

  if (isDefined(coreObjectIndexPagePath)) {
    const searchParams = new URLSearchParams({ viewId: view.id });

    return `${coreObjectIndexPagePath}?${searchParams}`;
  }

  return getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    { viewId: view.id },
  );
};
