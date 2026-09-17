import { defineLogicFunction } from 'twenty-sdk/define';
import { type AxiosInstance } from 'axios';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { getConnection, kv } from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { buildSyncPlan } from 'src/logic-functions/utils/build-sync-plan.util';
import { createTasks } from 'src/logic-functions/utils/create-tasks.util';
import { updateTasks } from 'src/logic-functions/utils/update-tasks.util';
import { createGoogleTasksClient } from 'src/logic-functions/utils/create-google-tasks-client.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { isTransientGoogleError } from 'src/logic-functions/utils/google-error.util';
import { toGoogleFailureResponseOrThrow } from 'src/logic-functions/utils/to-google-failure-response.util';
import { SYNC_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_TASKS_PAGE_SIZE } from 'src/constants/sync';
import {
  TaskListsResponse,
  TasksResponse,
} from 'src/logic-functions/types/types';

const lastSyncedAtKey = (connectionId: string) =>
  `sync:lastSyncedAt:${connectionId}`;

const fetchTaskListIds = async (axiosInstance: AxiosInstance) => {
  const listIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const response = await executeWithRetry(
      () =>
        axiosInstance.get<TaskListsResponse>('/tasks/v1/users/@me/lists', {
          params: pageToken === undefined ? {} : { pageToken },
        }),
      isTransientGoogleError,
    );

    listIds.push(...(response.data.items ?? []).map((list) => list.id));

    pageToken = response.data.nextPageToken;
  } while (pageToken !== undefined);

  return listIds;
};

const syncTaskList = async (
  axiosInstance: AxiosInstance,
  client: CoreApiClient,
  assigneeId: string,
  listId: string,
  updatedMin: string | null,
) => {
  const counts = { created: 0, updated: 0 };
  let pageToken: string | undefined;

  do {
    const response = await executeWithRetry(
      () =>
        axiosInstance.get<TasksResponse>(`/tasks/v1/lists/${listId}/tasks`, {
          params: {
            maxResults: GOOGLE_TASKS_PAGE_SIZE,
            showHidden: true,
            showCompleted: true,
            ...(isString(updatedMin) ? { updatedMin } : {}),
            ...(pageToken === undefined ? {} : { pageToken }),
          },
        }),
      isTransientGoogleError,
    );

    const googleTasks = response.data.items ?? [];
    const plan = await buildSyncPlan(client, googleTasks, listId);

    await createTasks(client, assigneeId, listId, plan.tasksToCreate);
    await updateTasks(client, plan.tasksToUpdate);

    counts.created += plan.tasksToCreate.length;
    counts.updated += plan.tasksToUpdate.length;

    pageToken = response.data.nextPageToken;
  } while (pageToken !== undefined);

  return counts;
};

const handler = async ({ connectionId }: { connectionId?: string }) => {
  if (isNonEmptyString(connectionId) === false) {
    return {
      success: false,
      error: 'Missing connectionId',
    };
  }

  const connection = await getConnection(connectionId);

  const assigneeId = connection.workspaceMemberId;

  if (assigneeId === null) {
    return {
      success: false,
      error: 'Connection has no workspace member',
    };
  }

  const client = new CoreApiClient();
  const axiosInstance = createGoogleTasksClient(connection.accessToken);

  const startedAt = new Date().toISOString();
  const updatedMin = await executeWithRetry(() =>
    kv.get<string>(lastSyncedAtKey(connectionId)),
  );

  const totals = { created: 0, updated: 0 };

  try {
    const listIds = await fetchTaskListIds(axiosInstance);

    for (const listId of listIds) {
      const counts = await syncTaskList(
        axiosInstance,
        client,
        assigneeId,
        listId,
        updatedMin,
      );

      totals.created += counts.created;
      totals.updated += counts.updated;
    }
  } catch (error) {
    return toGoogleFailureResponseOrThrow({
      error,
      connectionId,
      authorizationError: `Google Tasks rejected the credentials for connection ${connectionId}; the user must reconnect`,
    });
  }

  await executeWithRetry(() =>
    kv.set(lastSyncedAtKey(connectionId), startedAt),
  );

  return {
    success: true,
    ...totals,
  };
};

export default defineLogicFunction({
  universalIdentifier: SYNC_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-tasks',
  description: 'Syncs Google Tasks into Twenty for one user connection',
  timeoutSeconds: 900,
  handler,
});
