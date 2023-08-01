import { useCallback } from 'react';
import { getOperationName } from '@apollo/client/utilities';

import {
  GET_ACTIVITIES,
  GET_ACTIVITIES_BY_TARGETS,
} from '@/activities/queries';
import { Activity, useUpdateActivityMutation } from '~/generated/graphql';

type Task = Pick<Activity, 'id'>;

export function useCompleteTask(task: Task) {
  const [updateActivityMutation] = useUpdateActivityMutation();
  const completeTask = useCallback(
    (value: boolean) => {
      updateActivityMutation({
        variables: {
          where: { id: task.id },
          data: {
            completedAt: value ? new Date().toISOString() : null,
          },
        },
        refetchQueries: [
          getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
          getOperationName(GET_ACTIVITIES) ?? '',
        ],
      });
    },
    [task, updateActivityMutation],
  );

  return {
    completeTask,
  };
}
