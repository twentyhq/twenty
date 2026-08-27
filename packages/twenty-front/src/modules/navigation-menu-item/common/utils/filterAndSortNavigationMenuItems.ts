import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const filterAndSortNavigationMenuItems = (
  navigationMenuItems: NavigationMenuItem[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'isActive'>[],
): NavigationMenuItem[] => {
  const activeObjectMetadataItems = objectMetadataItems.filter(
    (meta) => meta.isActive,
  );

  const seenObjectMetadataIds = new Set<string>();
  const seenPageLayoutIds = new Set<string>();

  return navigationMenuItems
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter((item) => {
      if (item.type === NavigationMenuItemType.FOLDER) {
        return true;
      }

      if (item.type === NavigationMenuItemType.LINK) {
        return true;
      }

      if (item.type === NavigationMenuItemType.PAGE_LAYOUT) {
        if (
          !isDefined(item.pageLayoutId) ||
          seenPageLayoutIds.has(item.pageLayoutId)
        ) {
          return false;
        }
        seenPageLayoutIds.add(item.pageLayoutId);
        return true;
      }

      if (item.type === NavigationMenuItemType.OBJECT) {
        if (
          !isDefined(item.targetObjectMetadataId) ||
          seenObjectMetadataIds.has(item.targetObjectMetadataId)
        ) {
          return false;
        }

        const isActive = activeObjectMetadataItems.some(
          (meta) => meta.id === item.targetObjectMetadataId,
        );

        if (isActive) {
          seenObjectMetadataIds.add(item.targetObjectMetadataId);
          return true;
        }

        return false;
      }

      if (item.type === NavigationMenuItemType.VIEW) {
        if (!isDefined(item.viewId)) {
          return false;
        }

        const view = views.find((view) => view.id === item.viewId);
        return (
          isDefined(view) &&
          activeObjectMetadataItems.some(
            (meta) => meta.id === view.objectMetadataId,
          )
        );
      }

      if (item.type === NavigationMenuItemType.RECORD) {
        return (
          isDefined(item.targetRecordId) &&
          isDefined(item.targetObjectMetadataId) &&
          isDefined(item.targetRecordIdentifier) &&
          activeObjectMetadataItems.some(
            (meta) => meta.id === item.targetObjectMetadataId,
          )
        );
      }

      return false;
    });
};
