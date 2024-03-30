import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { Nullable } from '~/types/Nullable';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = (activity: Activity) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activityTargets = activity.activityTargets ?? [];

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const getRecordFromCache = useGetRecordFromCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const apolloClient = useApolloClient();

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetWithTargetRecord>>((activityTarget) => {
      const activityTargetFromCache = getRecordFromCache<ActivityTarget>(
        activityTarget.id,
        apolloClient.cache,
      );

      if (!isDefined(activityTargetFromCache)) {
        throw new Error(
          `Cannot find activity target ${activityTarget.id} in cache, this shouldn't happen.`,
        );
      }

      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(activityTargetFromCache[objectMetadataItem.nameSingular]) &&
          !objectMetadataItem.isSystem,
      );

      if (!correspondingObjectMetadataItem) {
        return undefined;
      }

      const targetObjectRecord =
        activityTargetFromCache[correspondingObjectMetadataItem.nameSingular];

      if (!targetObjectRecord) {
        throw new Error(
          `Cannot find target object record of type ${correspondingObjectMetadataItem.nameSingular}, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
        );
      }

      return {
        activityTarget: activityTargetFromCache ?? activityTarget,
        targetObject: targetObjectRecord ?? undefined,
        targetObjectMetadataItem: correspondingObjectMetadataItem,
      };
    })
    .filter(isDefined);

  return {
    activityTargetObjectRecords,
  };
};
