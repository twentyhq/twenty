import { isNonEmptyArray } from '@sniptt/guards';
import { useSetRecoilState } from 'recoil';

import { useModifyActivityTargetsOnActivityCache } from '@/activities/hooks/useModifyActivityTargetsOnActivityCache';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';

export const useCreateActivityFromEditor = () => {
  const setIsCreatingActivity = useSetRecoilState(isCreatingActivityState);

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

  const createActivity = async (activityToCreate: ActivityForEditor) => {
    const { activityWithConnection } = makeActivityWithConnection(
      activityToCreate as any,
    );

    await createOneActivity?.({
      ...activityWithConnection,
      updatedAt: new Date().toISOString(),
    });

    const activityTargetsToCreate = activityToCreate.activityTargets ?? [];

    if (isNonEmptyArray(activityTargetsToCreate)) {
      await createManyActivityTargets(activityTargetsToCreate);
    }

    modifyActivityTargetsOnActivityCache({
      activityId: activityToCreate.id,
      activityTargets: activityTargetsToCreate,
    });

    setIsCreatingActivity(false);
  };

  return {
    createActivity,
  };
};
