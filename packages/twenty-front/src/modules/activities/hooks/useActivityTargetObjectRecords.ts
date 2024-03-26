import { useRecoilValue } from 'recoil';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Nullable } from '~/types/Nullable';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = ({
  activity,
}: {
  activity: Activity;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activityTargets = activity.activityTargets;

  const { getRecordFromCache } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetWithTargetRecord>>((activityTarget) => {
      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(activityTarget[objectMetadataItem.nameSingular]) &&
          !objectMetadataItem.isSystem,
      );

      const activityTargetFromCache = getRecordFromCache<ActivityTarget>(
        activityTarget.id,
      );

      if (!correspondingObjectMetadataItem) {
        throw new Error(
          `Cannot find target object record on activity target, this shouldn't happen, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
        );
      }

      const targetObjectRecord = isDefined(activityTargetFromCache)
        ? activityTargetFromCache[correspondingObjectMetadataItem.nameSingular]
        : activityTarget[correspondingObjectMetadataItem.nameSingular];

      // if (!targetObjectRecord) {
      //   throw new Error(
      //     `Cannot find target object record of type ${correspondingObjectMetadataItem.nameSingular}, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
      //   );
      // }

      return {
        activityTarget: activityTargetFromCache ?? activityTarget,
        targetObject: targetObjectRecord ?? undefined,
        targetObjectMetadataItem: correspondingObjectMetadataItem,
        targetObjectNameSingular: correspondingObjectMetadataItem.nameSingular,
      };
    })
    .filter(isDefined);

  return {
    activityTargetObjectRecords,
  };
};
