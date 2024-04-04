import { isNonEmptyArray } from '@sniptt/guards';

import { CREATE_ONE_ACTIVITY_QUERY_KEY } from '@/activities/query-keys/CreateOneActivityQueryKey';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';

export const useCreateActivityInDB = () => {
  const { createOneRecord: createOneActivity } = useCreateOneRecord({
    objectNameSingular: CREATE_ONE_ACTIVITY_QUERY_KEY.objectNameSingular,
    queryFields: CREATE_ONE_ACTIVITY_QUERY_KEY.fields,
    depth: CREATE_ONE_ACTIVITY_QUERY_KEY.depth,
  });

  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      skipPostOptmisticEffect: true,
    });

  const createActivityInDB = async (activityToCreate: ActivityForEditor) => {
    await createOneActivity?.({
      ...activityToCreate,
      updatedAt: new Date().toISOString(),
    });

    const activityTargetsToCreate = activityToCreate.activityTargets ?? [];

    if (isNonEmptyArray(activityTargetsToCreate)) {
      await createManyActivityTargets(activityTargetsToCreate);
    }
  };

  return {
    createActivityInDB,
  };
};
