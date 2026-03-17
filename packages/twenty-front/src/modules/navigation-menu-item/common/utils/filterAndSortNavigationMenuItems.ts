import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const filterAndSortNavigationMenuItems = (
  navigationMenuItems: NavigationMenuItem[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
  objectMetadataItems: Pick<ObjectMetadataItem, 'id'>[],
): NavigationMenuItem[] => {
  return navigationMenuItems
    .filter((item) => {
      let keep = false;

      if (item.type === NavigationMenuItemType.FOLDER) {
        keep = true;
      } else if (item.type === NavigationMenuItemType.LINK) {
        keep = true;
      } else if (item.type === NavigationMenuItemType.OBJECT) {
        keep =
          isDefined(item.targetObjectMetadataId) &&
          objectMetadataItems.some(
            (meta) => meta.id === item.targetObjectMetadataId,
          );
      } else if (item.type === NavigationMenuItemType.VIEW) {
        if (!isDefined(item.viewId)) {
          keep = false;
        } else {
          const view = views.find((view) => view.id === item.viewId);
          keep =
            isDefined(view) &&
            objectMetadataItems.some(
              (meta) => meta.id === view.objectMetadataId,
            );
        }
      } else if (item.type === NavigationMenuItemType.RECORD) {
        const hasTargetRecordId = isDefined(item.targetRecordId);
        const hasTargetObjectMetadataId = isDefined(
          item.targetObjectMetadataId,
        );
        const hasTargetRecordIdentifier = isDefined(
          item.targetRecordIdentifier,
        );
        const objectMetadataExists = objectMetadataItems.some(
          (meta) => meta.id === item.targetObjectMetadataId,
        );
        keep =
          hasTargetRecordId &&
          hasTargetObjectMetadataId &&
          hasTargetRecordIdentifier &&
          objectMetadataExists;
      }

      return keep;
    })
    .sort((a, b) => a.position - b.position);
};
