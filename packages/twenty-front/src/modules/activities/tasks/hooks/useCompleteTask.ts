import { useCallback } from 'react';

import { Activity } from '@/activities/types/Activity';
import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: 'activity',
    // refetchFindManyQuery: true,
  });

  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular: 'activity',
  });

  const completeTask = useCallback(
    async (value: boolean) => {
      const completedAt = value ? new Date().toISOString() : null;
      const data = await updateOneActivity?.({
        idToUpdate: task.id,
        input: {
          completedAt,
        },
        // forceRefetch: true,
      });
      triggerOptimisticEffects({ typename: 'ActivityEdge', updatedData: data });
    },
    [task.id, updateOneActivity, triggerOptimisticEffects],
  );

  return {
    completeTask,
  };
};
