import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  ViewType,
} from '~/generated-metadata/graphql';

export const getObjectNavigationMenuItemComputedLink = ({
  item,
  objectMetadataItems,
  views,
  lastVisitedViewId,
  isSeededDefaultViewEnabled = false,
}: {
  item: Pick<NavigationMenuItem, 'targetObjectMetadataId'>;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'namePlural'>[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key' | 'type' | 'position'>[];
  lastVisitedViewId?: string;
  isSeededDefaultViewEnabled?: boolean;
}): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (!isDefined(objectMetadataItem)) {
    return '';
  }

  const selectableViewsOnObject = views
    .filter(
      (view) =>
        view.objectMetadataId === objectMetadataItem.id &&
        view.type !== ViewType.FIELDS_WIDGET,
    )
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

  const seededDefaultViewId = isSeededDefaultViewEnabled
    ? selectableViewsOnObject.find((view) => view.key !== ViewKey.INDEX)?.id
    : undefined;

  const indexViewId = selectableViewsOnObject.find(
    (view) => view.key === ViewKey.INDEX,
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
