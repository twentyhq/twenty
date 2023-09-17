import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { Activity, useUpdateActivityMutation } from '~/generated/graphql';

import { ACTIVITY_UPDATE_FRAGMENT } from '../../graphql/fragments/activityUpdateFragment';
import { GET_ACTIVITIES } from '../../graphql/queries/getActivities';

type Task = Pick<Activity, 'id' | 'completedAt'>;

export const useCompleteTask = (task: Task) => {
  const [updateActivityMutation] = useUpdateActivityMutation();

  const client = useApolloClient();
  const cachedTask = client.readFragment({
    id: `Activity:${task.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

  const completeTask = useCallback(
    (value: boolean) => {
      const completedAt = value ? new Date().toISOString() : null;
      updateActivityMutation({
        variables: {
          where: { id: task.id },
          data: {
            completedAt,
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateOneActivity: {
            ...cachedTask,
            completedAt,
          },
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES) ?? ''],
      });
    },
    [cachedTask, task.id, updateActivityMutation],
  );

  return {
    completeTask,
  };
};
