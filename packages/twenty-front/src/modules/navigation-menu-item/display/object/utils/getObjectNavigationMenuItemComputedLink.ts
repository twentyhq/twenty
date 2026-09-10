import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  ViewType,
} from '~/generated-metadata/graphql';

export const getObjectNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'targetObjectMetadataId'>,
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'namePlural'>[],
  views: Pick<View, 'id' | 'objectMetadataId' | 'key' | 'type'>[],
  lastVisitedViewId?: string,
  isSeededDefaultViewEnabled = false,
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (!isDefined(objectMetadataItem)) {
    return '';
  }

  const seededDefaultViewId = isSeededDefaultViewEnabled
    ? views.find(
        (view) =>
          view.objectMetadataId === objectMetadataItem.id &&
          view.type !== ViewType.FIELDS_WIDGET &&
          view.key !== ViewKey.INDEX,
      )?.id
    : undefined;

  const indexViewId = views.find(
    (view) =>
      view.objectMetadataId === objectMetadataItem.id &&
      view.key === ViewKey.INDEX,
  )?.id;

  const applicableLastVisitedViewId =
    isSeededDefaultViewEnabled && lastVisitedViewId === indexViewId
      ? undefined
      : lastVisitedViewId;

  const targetViewId =
    applicableLastVisitedViewId ?? seededDefaultViewId ?? indexViewId;

  return getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    isDefined(targetViewId) ? { viewId: targetViewId } : undefined,
  );
};
