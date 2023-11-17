import { useCallback } from 'react';

import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { Activity } from '~/generated/graphql';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const { updateOneObject } = useUpdateOneObjectRecord({
    objectNameSingular: 'activityV2',
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
