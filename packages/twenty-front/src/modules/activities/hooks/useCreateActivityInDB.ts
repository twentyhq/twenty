import { isNonEmptyArray } from '@sniptt/guards';

import { useModifyActivityTargetsOnActivityCache } from '@/activities/hooks/useModifyActivityTargetsOnActivityCache';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';

export const useCreateActivityInDB = () => {
  const { createOneRecord: createOneActivity } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { createManyRecords: createManyActivityTargets } =
    useCreateManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { makeActivityWithConnection } = useActivityConnectionUtils();

  const { modifyActivityTargetsOnActivityCache } =
    useModifyActivityTargetsOnActivityCache();

  const createActivityInDB = async (activityToCreate: ActivityForEditor) => {
    const { activityWithConnection } = makeActivityWithConnection(
      activityToCreate as any, // TODO: fix type
    );

    await createOneActivity?.(
      {
        ...activityWithConnection,
        updatedAt: new Date().toISOString(),
      },
      {
        skipOptimisticEffect: true,
      },
    );

    const activityTargetsToCreate = activityToCreate.activityTargets ?? [];

    if (isNonEmptyArray(activityTargetsToCreate)) {
      await createManyActivityTargets(activityTargetsToCreate, {
        skipOptimisticEffect: true,
      });
    }

    // TODO: replace by trigger optimistic effect
    modifyActivityTargetsOnActivityCache({
      activityId: activityToCreate.id,
      activityTargets: activityTargetsToCreate,
    });
  };

  return {
    createActivityInDB,
  };
};
