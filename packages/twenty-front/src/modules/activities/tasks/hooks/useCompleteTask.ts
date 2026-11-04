import { useCallback } from 'react';

import { type Task } from '@/activities/types/Task';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useCompleteTask = (task: Task) => {
  const { updateOneRecord } = useUpdateOneRecord();

  const completeTask = useCallback(
    async (value: boolean) => {
      const status = value ? 'DONE' : 'TODO';
      await updateOneRecord({
        objectNameSingular: StandardObjectNameSingular.Task,
        idToUpdate: task.id,
        updateOneRecordInput: {
          status,
        },
      });
    },
    [task.id, updateOneRecord],
  );

  return {
    completeTask,
  };
};
