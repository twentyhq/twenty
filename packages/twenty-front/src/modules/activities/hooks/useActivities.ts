import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilCallback } from 'recoil';

export const useActivities = <T extends Task | Note>({
  objectNameSingular,
  targetableObjects,
  activityTargetsOrderByVariables,
  skip,
}: {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  targetableObjects: ActivityTargetableObject[];
  activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
  skip?: boolean;
}) => {
  const { activityTargets, loadingActivityTargets, totalCountActivityTargets } =
    useActivityTargetsForTargetableObjects({
      objectNameSingular,
      targetableObjects,
      skip: skip,
      activityTargetsOrderByVariables,
      onCompleted: useRecoilCallback(
        ({ set }) =>
          (activityTargets) => {
            for (const activityTarget of activityTargets) {
              const activity = activityTarget[objectNameSingular];
              set(recordStoreFamilyState(activity.id), activity);
            }
          },
        [objectNameSingular],
      ),
    });

  const activities = activityTargets.map((activityTarget) => {
    return activityTarget[objectNameSingular];
  }) as T[];

  return {
    activities: activities as T[],
    loading: loadingActivityTargets,
    totalCountActivities: totalCountActivityTargets,
  };
};
