import { useCallback, useEffect, useState } from 'react';

import { type Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useCompleteTask = (task: Task) => {
  const { updateOneRecord } = useUpdateOneRecord();

  // Remembers the status the task had before it was marked DONE, so
  // reopening it restores that status instead of defaulting to TODO.
  const [previousStatus, setPreviousStatus] = useState<Task['status']>('TODO');

  useEffect(() => {
    if (task.status && task.status !== 'DONE') {
      setPreviousStatus(task.status);
    }
  }, [task.status]);

  const completeTask = useCallback(
    async (value: boolean) => {
      const status = value ? 'DONE' : previousStatus;
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: task.id,
        updateOneRecordInput: {
          status,
        },
      });
    },
    [task.id, previousStatus, updateOneRecord],
  );

  return {
    completeTask,
  };
};
