import { useCallback } from 'react';

import { Activity } from '@/activities/types/Activity';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const completeTask = useCallback(
    async (value: boolean) => {
      const completedAt = value ? new Date().toISOString() : null;
      await updateOneActivity?.({
        idToUpdate: task.id,
        updateOneRecordInput: {
          completedAt,
        },
      });
    },
    [task.id, updateOneActivity],
  );

  return {
    completeTask,
  };
};
