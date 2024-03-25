import { useRecoilValue } from 'recoil';

import { Activity } from '@/activities/types/Activity';
import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { Nullable } from '~/types/Nullable';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = ({
  activity,
}: {
  activity: Activity;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activityTargets = activity.activityTargets;

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetWithTargetRecord>>((activityTarget) => {
      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(activityTarget[objectMetadataItem.nameSingular]) &&
          !objectMetadataItem.isSystem,
      );

      if (!correspondingObjectMetadataItem) {
        throw new Error(
          `Cannot find target object record on activity target, this shouldn't happen, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
        );
      }

      const targetObjectRecord =
        activityTarget[correspondingObjectMetadataItem.nameSingular];

      if (!targetObjectRecord) {
        throw new Error(
          `Cannot find target object record of type ${correspondingObjectMetadataItem.nameSingular}, make sure the request for activities eagerly loads for the target objects on activity target relation.`,
        );
      }

      return {
        activityTarget: activityTarget,
        targetObject:
          activityTarget[correspondingObjectMetadataItem.nameSingular],
        targetObjectMetadataItem: correspondingObjectMetadataItem,
        targetObjectNameSingular: correspondingObjectMetadataItem.nameSingular,
      };
    })
    .filter(isDefined);

  return {
    activityTargetObjectRecords,
  };
};
