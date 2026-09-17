import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import {
  findConnectionForRequest,
  listConnections,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { fetchTaskNodes } from 'src/logic-functions/utils/fetch-task-nodes.util';
import { pushTasks } from 'src/logic-functions/utils/push-tasks.util';
import { createGoogleTasksClient } from 'src/logic-functions/utils/create-google-tasks-client.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { toGoogleFailureResponseOrThrow } from 'src/logic-functions/utils/to-google-failure-response.util';
import { PUSH_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  AUTHORIZATION_FAILED_ERROR,
  INVALID_TASK_IDS_ERROR,
  NO_CONNECTION_ERROR,
} from 'src/constants/push-tasks-errors';
import {
  GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
  PUSH_TASKS_ROUTE_PATH,
} from 'src/constants/sync';

const handler = async (params: RoutePayload<{ taskIds: string[] }>) => {
  const taskIds = params.body?.taskIds;

  if (!isNonEmptyArray(taskIds) || !taskIds.every(isNonEmptyString)) {
    return {
      success: false,
      error: INVALID_TASK_IDS_ERROR,
    };
  }

  const connections = await executeWithRetry(() =>
    listConnections({ providerName: GOOGLE_TASKS_CONNECTION_PROVIDER_NAME }),
  );

  const connection = findConnectionForRequest(connections, params);

  if (
    connection === null ||
    connection.authFailedAt !== null ||
    connection.visibility === 'workspace'
  ) {
    return {
      success: false,
      error: NO_CONNECTION_ERROR,
    };
  }

  const client = new CoreApiClient();
  const axiosInstance = createGoogleTasksClient(connection.accessToken);

  const tasks = await fetchTaskNodes(client, {
    id: { in: taskIds },
    deletedAt: { is: 'NULL' },
  });

  try {
    const { hasFailures } = await pushTasks(axiosInstance, client, tasks);

    return {
      success: true,
      hasFailures,
    };
  } catch (error) {
    return toGoogleFailureResponseOrThrow({
      error,
      connectionId: connection.id,
      authorizationError: AUTHORIZATION_FAILED_ERROR,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: PUSH_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'push-tasks',
  description: 'Sends the selected Twenty tasks to the requester Google Tasks',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: PUSH_TASKS_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
