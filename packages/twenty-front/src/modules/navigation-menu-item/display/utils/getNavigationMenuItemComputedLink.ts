import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemComputedLink = (
  item: NavigationMenuItem,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[],
): string => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT: {
      const objectMetadataItem = objectMetadataItems.find(
        (meta) => meta.id === item.targetObjectMetadataId,
      );
      if (!isDefined(objectMetadataItem)) {
        return '';
      }
      const indexView = views.find(
        (view) =>
          view.objectMetadataId === objectMetadataItem.id &&
          view.key === ViewKey.INDEX,
      );
      return getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        indexView ? { viewId: indexView.id } : {},
      );
    }
    case NavigationMenuItemType.VIEW: {
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
    }
    case NavigationMenuItemType.LINK: {
      const linkUrl = (item.link ?? '').trim();
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        return linkUrl;
      }
      return linkUrl ? `https://${linkUrl}` : '';
    }
    case NavigationMenuItemType.RECORD: {
      const objectMetadataItem = objectMetadataItems.find(
        (meta) => meta.id === item.targetObjectMetadataId,
      );
      if (
        !isDefined(objectMetadataItem) ||
        !isDefined(item.targetRecordIdentifier)
      ) {
        return '';
      }
      const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier({
        recordIdentifier: item.targetRecordIdentifier,
        objectMetadataItem,
      });
      return objectRecordIdentifier.linkToShowPage ?? '';
    }
    default:
      return '';
  }
};
