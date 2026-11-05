import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isNativePageKey } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const filterAndSortNavigationMenuItems = ({
  navigationMenuItems,
  views,
  objectMetadataItems,
}: {
  navigationMenuItems: NavigationMenuItem[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[];
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'isActive' | 'universalIdentifier'
  >[];
}): NavigationMenuItem[] => {
  const activeObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isActive,
  );

  // Chat favorites are listed in the chat menu instead
  const hiddenRecordObjectUniversalIdentifiers: string[] = [
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    STANDARD_OBJECTS.workflow.universalIdentifier,
  ];

  const hiddenRecordObjectMetadataIds = new Set(
    activeObjectMetadataItems
      .filter((objectMetadataItem) =>
        hiddenRecordObjectUniversalIdentifiers.includes(
          objectMetadataItem.universalIdentifier,
        ),
      )
      .map((objectMetadataItem) => objectMetadataItem.id),
  );

  return navigationMenuItems
    .filter((item) => {
      if (item.type === NavigationMenuItemType.FOLDER) {
        return true;
      }
      if (item.type === NavigationMenuItemType.LINK) {
        return true;
      }
      if (item.type === NavigationMenuItemType.NATIVE_PAGE) {
        return isNativePageKey(item.nativePageKey);
      }
      if (item.type === NavigationMenuItemType.PAGE_LAYOUT) {
        return isDefined(item.pageLayoutId);
      }
      if (item.type === NavigationMenuItemType.OBJECT) {
        return (
          isDefined(item.targetObjectMetadataId) &&
          activeObjectMetadataItems.some(
            (objectMetadataItem) =>
              objectMetadataItem.id === item.targetObjectMetadataId,
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
            (objectMetadataItem) =>
              objectMetadataItem.id === view.objectMetadataId,
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
            (objectMetadataItem) =>
              objectMetadataItem.id === item.targetObjectMetadataId,
          )
        );
      }
      return false;
    })
    .sort((a, b) => a.position - b.position);
};
