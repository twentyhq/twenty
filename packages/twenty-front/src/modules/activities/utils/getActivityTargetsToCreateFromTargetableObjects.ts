import { v4 } from 'uuid';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const makeActivityTargetsToCreateFromTargetableObjects = ({
  targetableObjects,
  activity,
  targetObjectRecords,
}: {
  targetableObjects: ActivityTargetableObject[];
  activity: Task | Note;
  targetObjectRecords: ObjectRecord[];
}): Partial<NoteTarget | TaskTarget>[] => {
  const activityTargetsToCreate = targetableObjects.map((targetableObject) => {
    const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

    const relatedObjectRecord = targetObjectRecords.find(
      (record) => record.id === targetableObject.id,
    );

    const activityTarget = {
      [targetableObject.targetObjectNameSingular]: relatedObjectRecord,
      [targetableObjectFieldIdName]: targetableObject.id,
      activity,
      activityId: activity.id,
      id: v4(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    } as Partial<NoteTarget | TaskTarget>;

    return activityTarget;
  });

  return activityTargetsToCreate;
};
