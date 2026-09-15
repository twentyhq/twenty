import { defineLogicFunction, RoutePayload } from 'twenty-sdk/define';
import axios from 'axios';
import { isNonEmptyArray } from '@sniptt/guards';
import {
  findConnectionForRequest,
  listConnections,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { fetchTaskNodes } from 'src/logic-functions/utils/fetch-task-nodes.util';
import { pushTasks } from 'src/logic-functions/utils/push-tasks.util';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import {
  isGoogleAuthorizationFailure,
  isTransientGoogleError,
} from 'src/logic-functions/utils/google-error.util';
import { PUSH_TASKS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  AUTHORIZATION_FAILED_ERROR,
  MISSING_TASK_IDS_ERROR,
  NO_CONNECTION_ERROR,
} from 'src/constants/push-tasks-errors';
import {
  GOOGLE_TASKS_BASE_API_URL,
  GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
  PUSH_TASKS_ROUTE_PATH,
} from 'src/constants/sync';

const handler = async (params: RoutePayload<{ taskIds: string[] }>) => {
  const taskIds = params.body?.taskIds;

  if (!isNonEmptyArray(taskIds)) {
    return {
      success: false,
      error: MISSING_TASK_IDS_ERROR,
    };
  }

  const connections = await executeWithRetry(() =>
    listConnections({ providerName: GOOGLE_TASKS_CONNECTION_PROVIDER_NAME }),
  );

  const connection = findConnectionForRequest(connections, params);

  if (connection === null || connection.authFailedAt !== null || connection.visibility === 'workspace') {
    return {
      success: false,
      error: NO_CONNECTION_ERROR,
    };
  }

  const client = new CoreApiClient();
  const axiosInstance = axios.create({
    baseURL: GOOGLE_TASKS_BASE_API_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${connection.accessToken}`,
    },
  });

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
    if (isTransientGoogleError(error)) {
      throw new RetryableLogicFunctionError(
        `Google Tasks is temporarily unavailable for connection ${connection.id}: ${(error as Error).message}`,
      );
    }

    if (isGoogleAuthorizationFailure(error)) {
      return {
        success: false,
        error: AUTHORIZATION_FAILED_ERROR,
      };
    }

    throw error;
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
