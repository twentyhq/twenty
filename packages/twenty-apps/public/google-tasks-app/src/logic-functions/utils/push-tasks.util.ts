import { type AxiosInstance } from 'axios';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import {
  GOOGLE_TASKS_DEFAULT_LIST_ID,
  PUSH_CONCURRENCY,
} from 'src/constants/sync';
import {
  type GoogleTask,
  type GoogleTaskPayload,
  type PushTasksResult,
  type TaskNode,
} from 'src/logic-functions/types/types';
import { buildGoogleTaskPayload } from 'src/logic-functions/utils/build-google-task-payload.util';
import { chunk } from 'src/logic-functions/utils/chunk.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import {
  isGoogleAuthorizationFailure,
  isGoogleRateLimitError,
  isTransientGoogleError,
} from 'src/logic-functions/utils/google-error.util';

type TaskListResponse = {
  id: string;
};

const createGoogleTask = async (
  axiosInstance: AxiosInstance,
  listId: string,
  payload: GoogleTaskPayload,
) => {
  const response = await executeWithRetry(
    () =>
      axiosInstance.post<GoogleTask>(
        `/tasks/v1/lists/${listId}/tasks`,
        payload,
      ),
    isGoogleRateLimitError,
  );

  return response.data.id;
};

const deleteGoogleTask = async (
  axiosInstance: AxiosInstance,
  listId: string,
  googleTasksId: string,
) => {
  await executeWithRetry(
    () =>
      axiosInstance.delete(`/tasks/v1/lists/${listId}/tasks/${googleTasksId}`),
    isTransientGoogleError,
  );
};

const patchGoogleTask = async (
  axiosInstance: AxiosInstance,
  listId: string,
  googleTasksId: string,
  payload: GoogleTaskPayload,
) => {
  await executeWithRetry(
    () =>
      axiosInstance.patch(
        `/tasks/v1/lists/${listId}/tasks/${googleTasksId}`,
        payload,
      ),
    isTransientGoogleError,
  );
};

const linkTaskToGoogle = async (
  client: CoreApiClient,
  taskId: string,
  googleTasksId: string,
  listId: string,
) => {
  await executeWithRetry(() =>
    client.mutation({
      updateTask: {
        __args: {
          id: taskId,
          data: { googleTasksId, googleTasksListId: listId },
        },
        id: true,
      },
    }),
  );
};

const resolveDefaultListId = async (axiosInstance: AxiosInstance) => {
  const response = await executeWithRetry(
    () =>
      axiosInstance.get<TaskListResponse>(
        `/tasks/v1/users/@me/lists/${GOOGLE_TASKS_DEFAULT_LIST_ID}`,
      ),
    isTransientGoogleError,
  );

  return response.data.id;
};

export const pushTasks = async (
  axiosInstance: AxiosInstance,
  client: CoreApiClient,
  tasks: TaskNode[],
): Promise<PushTasksResult> => {
  if (tasks.length === 0) {
    return { hasFailures: false };
  }

  const requiresDefaultList = tasks.some(
    (task) => !isNonEmptyString(task.googleTasksListId),
  );
  const defaultListId = requiresDefaultList
    ? await resolveDefaultListId(axiosInstance)
    : null;
  let hasFailures = false;

  for (const batch of chunk(tasks, PUSH_CONCURRENCY)) {
    const outcomes = await Promise.all(
      batch.map(async (task): Promise<boolean> => {
        const payload = buildGoogleTaskPayload(task);
        const listId = isNonEmptyString(task.googleTasksListId)
          ? task.googleTasksListId
          : defaultListId;

        if (!isNonEmptyString(listId)) {
          return false;
        }

        try {
          if (isNonEmptyString(task.googleTasksId)) {
            await patchGoogleTask(
              axiosInstance,
              listId,
              task.googleTasksId,
              payload,
            );

            return true;
          }

          const googleTasksId = await createGoogleTask(
            axiosInstance,
            listId,
            payload,
          );

          try {
            await linkTaskToGoogle(client, task.id, googleTasksId, listId);
          } catch (error) {
            await deleteGoogleTask(axiosInstance, listId, googleTasksId);
            throw error;
          }

          return true;
        } catch (error) {
          if (isGoogleAuthorizationFailure(error)) {
            throw error;
          }

          return false;
        }
      }),
    );

    hasFailures = hasFailures || outcomes.includes(false);
  }

  return { hasFailures };
};
