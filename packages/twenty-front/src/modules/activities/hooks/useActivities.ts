import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useActivities = <T extends Task | Note>({
  objectNameSingular,
  targetableObjects,
  activityTargetsOrderByVariables,
  skip,
  limit,
}: {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  targetableObjects: ActivityTargetableObject[];
  activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
  skip?: boolean;
  limit: number;
}) => {
  const updateActivitiesInStore = useRecoilCallback(
    ({ set }) =>
      (activityTargets: (TaskTarget | NoteTarget)[]) => {
        for (const activityTarget of activityTargets) {
          const activity = activityTarget[objectNameSingular];
          set(recordStoreFamilyState(activity.id), activity);
        }
      },
    [objectNameSingular],
  );

  const {
    activityTargets,
    loadingActivityTargets,
    totalCountActivityTargets,
    fetchMoreActivityTargets,
    hasNextPage,
  } = useActivityTargetsForTargetableObjects({
    objectNameSingular,
    targetableObjects,
    skip: skip,
    activityTargetsOrderByVariables,
    onCompleted: updateActivitiesInStore,
    limit,
  });

  const activities = activityTargets.map((activityTarget) => {
    return activityTarget[objectNameSingular];
  }) as T[];

  const fetchMoreActivities = async () => {
    const result = await fetchMoreActivityTargets();

    if (!isDefined(result?.data)) {
      return [];
    }

    const activityTargets = getRecordsFromRecordConnection<
      TaskTarget | NoteTarget
    >({
      recordConnection: result.data,
    });

    updateActivitiesInStore(activityTargets);

    return activityTargets.map((activityTarget) => {
      return activityTarget[objectNameSingular];
    }) as T[];
  };

  return {
    activities: activities as T[],
    loading: loadingActivityTargets,
    totalCountActivities: totalCountActivityTargets,
    fetchMoreActivities,
    hasNextPage,
  };
};
