import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { Nullable } from 'twenty-ui';

import { ActivityTargetWithTargetRecord } from '@/activities/types/ActivityTargetObject';
import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getJoinObjectNameSingular } from '@/activities/utils/getJoinObjectNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { isDefined } from '~/utils/isDefined';

export const useActivityTargetObjectRecords = (
  activity: Task | Note,
  objectNameSingular: CoreObjectNameSingular,
) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activityTargets =
    'noteTargets' in activity && activity.noteTargets
      ? activity.noteTargets
      : 'taskTargets' in activity && activity.taskTargets
        ? activity.taskTargets
        : [];

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: getJoinObjectNameSingular(objectNameSingular),
  });

  const apolloClient = useApolloClient();

  const activityTargetObjectRecords = activityTargets
    .map<Nullable<ActivityTargetWithTargetRecord>>((activityTarget) => {
      const activityTargetFromCache = getRecordFromCache<
        NoteTarget | TaskTarget
      >(activityTarget.id, apolloClient.cache);

      if (!isDefined(activityTargetFromCache)) {
        throw new Error(
          `Cannot find activity target ${activityTarget.id} in cache, this shouldn't happen.`,
        );
      }

      const correspondingObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          isDefined(activityTargetFromCache[objectMetadataItem.nameSingular]) &&
          ![CoreObjectNameSingular.Note, CoreObjectNameSingular.Task].includes(
            objectMetadataItem.nameSingular as CoreObjectNameSingular,
          ),
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
