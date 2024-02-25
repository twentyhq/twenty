import { v4 } from 'uuid';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { flattenTargetableObjectsAndTheirRelatedTargetableObjects } from '@/activities/utils/flattenTargetableObjectsAndTheirRelatedTargetableObjects';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const makeActivityTargetsToCreateFromTargetableObjects = ({
  targetableObjects,
  activityId,
  targetObjectRecords,
}: {
  targetableObjects: ActivityTargetableObject[];
  activityId: string;
  targetObjectRecords: ObjectRecord[];
}): Partial<ActivityTarget>[] => {
  const activityTargetableObjects = targetableObjects
    ? flattenTargetableObjectsAndTheirRelatedTargetableObjects(
        targetableObjects,
      )
    : [];

  const activityTargetsToCreate = activityTargetableObjects.map(
    (targetableObject) => {
      const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
        nameSingular: targetableObject.targetObjectNameSingular,
      });

      const relatedObjectRecord = targetObjectRecords.find(
        (record) => record.id === targetableObject.id,
      );

      const activityTarget = {
        [targetableObject.targetObjectNameSingular]: relatedObjectRecord,
        [targetableObjectFieldIdName]: targetableObject.id,
        activityId,
        id: v4(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      } as Partial<ActivityTarget>;

      return activityTarget;
    },
  );

  return activityTargetsToCreate;
};
