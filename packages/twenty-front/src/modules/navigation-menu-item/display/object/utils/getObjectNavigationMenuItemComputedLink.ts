import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { computeObjectViewTargetIds } from '@/views/utils/computeObjectViewTargetIds';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getObjectNavigationMenuItemComputedLink = ({
  item,
  objectMetadataItems,
  views,
  lastVisitedViewId,
  isInitialObjectViewEnabled = false,
}: {
  item: Pick<NavigationMenuItem, 'targetObjectMetadataId'>;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'namePlural'>[];
  views: Pick<View, 'id' | 'objectMetadataId' | 'key' | 'type' | 'position'>[];
  lastVisitedViewId?: string;
  isInitialObjectViewEnabled?: boolean;
}): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (!isDefined(objectMetadataItem)) {
    return '';
  }

  const { firstSelectableViewId, indexViewId } = computeObjectViewTargetIds({
    views,
    objectMetadataId: objectMetadataItem.id,
    isInitialObjectViewEnabled,
  });

  const applicableLastVisitedViewId =
    isInitialObjectViewEnabled && lastVisitedViewId === indexViewId
      ? undefined
      : lastVisitedViewId;

  const targetViewId =
    applicableLastVisitedViewId ?? firstSelectableViewId ?? indexViewId;

  return getAppPath(
    AppPath.RecordIndexPage,
    { objectNamePlural: objectMetadataItem.namePlural },
    isDefined(targetViewId) ? { viewId: targetViewId } : undefined,
  );
};
