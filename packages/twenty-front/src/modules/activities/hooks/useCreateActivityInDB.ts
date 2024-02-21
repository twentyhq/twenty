import { isNonEmptyArray } from '@sniptt/guards';

import { useActivityConnectionUtils } from '@/activities/hooks/useActivityConnectionUtils';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
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
  };

  return {
    createActivityInDB,
  };
};
