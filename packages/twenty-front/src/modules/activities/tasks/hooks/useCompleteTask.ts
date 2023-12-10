import { useCallback } from 'react';

import { Activity } from '@/activities/types/Activity';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord({
    objectNameSingular: 'activity',
    refetchFindManyQuery: true,
  });

  const completeTask = useCallback(
    (value: boolean) => {
      const completedAt = value ? new Date().toISOString() : null;
      updateOneActivity?.({
        idToUpdate: task.id,
        input: {
          completedAt,
        },
        forceRefetch: true,
      });
    },
    [task.id, updateOneActivity],
  );

  return {
    completeTask,
  };
};
