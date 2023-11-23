import { useCallback } from 'react';

import { Activity } from '@/activities/types/Activity';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const { updateOneObject } = useUpdateOneObjectRecord({
    objectNameSingular: 'activity',
  });

  const completeTask = useCallback(
    (value: boolean) => {
      const completedAt = value ? new Date().toISOString() : null;
      updateOneObject?.({
        idToUpdate: task.id,
        input: {
          completedAt,
        },
      });
    },
    [task.id, updateOneObject],
  );

  return {
    completeTask,
  };
};
