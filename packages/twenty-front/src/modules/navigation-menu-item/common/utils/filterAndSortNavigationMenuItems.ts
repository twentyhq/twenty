import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import {
  CoreObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const filterAndSortNavigationMenuItems = (
  navigationMenuItems: NavigationMenuItem[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'isActive' | 'nameSingular'
  >[],
  isWorkflowCoreIndexPageEnabled: boolean,
): NavigationMenuItem[] => {
  const activeObjectMetadataItems = objectMetadataItems.filter(
    (meta) => meta.isActive,
  );

  const hiddenRecordObjectMetadataIds = new Set(
    isWorkflowCoreIndexPageEnabled
      ? activeObjectMetadataItems
          .filter(
            (meta) => meta.nameSingular === CoreObjectNameSingular.Workflow,
          )
          .map((meta) => meta.id)
      : [],
  );

  return navigationMenuItems
    .filter((item) => {
      if (item.type === NavigationMenuItemType.FOLDER) {
        return true;
      }
      if (item.type === NavigationMenuItemType.LINK) {
        return true;
      }
      if (item.type === NavigationMenuItemType.PAGE_LAYOUT) {
        return isDefined(item.pageLayoutId);
      }
      if (item.type === NavigationMenuItemType.OBJECT) {
        return (
          isDefined(item.targetObjectMetadataId) &&
          activeObjectMetadataItems.some(
            (meta) => meta.id === item.targetObjectMetadataId,
          )
        );
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
          !hiddenRecordObjectMetadataIds.has(item.targetObjectMetadataId) &&
          activeObjectMetadataItems.some(
            (meta) => meta.id === item.targetObjectMetadataId,
          )
        );
      }
      return false;
    })
    .sort((a, b) => a.position - b.position);
};
