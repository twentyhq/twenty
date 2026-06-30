import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getObjectMetadataForNavigationMenuItem = (
  navigationMenuItem: Pick<
    NavigationMenuItem,
    'type' | 'viewId' | 'targetObjectMetadataId'
  >,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  views: Pick<View, 'id' | 'objectMetadataId'>[],
): EnrichedObjectMetadataItem | null => {
  if (navigationMenuItem.type === NavigationMenuItemType.LINK) {
    return null;
  }

  if (
    navigationMenuItem.type === NavigationMenuItemType.OBJECT &&
    isDefined(navigationMenuItem.targetObjectMetadataId)
  ) {
    return (
      objectMetadataItems.find(
        (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
      ) ?? null
    );
  }

  if (
    navigationMenuItem.type === NavigationMenuItemType.VIEW &&
    isDefined(navigationMenuItem.viewId)
  ) {
    const view = views.find((view) => view.id === navigationMenuItem.viewId);
    if (!isDefined(view)) {
      return null;
    }
    return (
      objectMetadataItems.find((meta) => meta.id === view.objectMetadataId) ??
      null
    );
  }

  if (
    navigationMenuItem.type === NavigationMenuItemType.RECORD &&
    isDefined(navigationMenuItem.targetObjectMetadataId)
  ) {
    return (
      objectMetadataItems.find(
        (meta) => meta.id === navigationMenuItem.targetObjectMetadataId,
      ) ?? null
    );
  }

  return null;
};
