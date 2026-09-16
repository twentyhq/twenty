import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { PUSH_TASKS_ROUTE_PATH } from 'src/constants/sync';
import {
  AUTHORIZATION_FAILED_ERROR,
  NO_CONNECTION_ERROR,
} from 'src/constants/push-tasks-errors';

type PushTasksResponse = {
  success?: boolean;
  error?: string;
  hasFailures?: boolean;
};

const buildSnackbarForResponse = (
  response: PushTasksResponse,
): { message: string; variant: 'success' | 'error' } => {
  if (response.success !== true) {
    const needsConnection =
      response.error === NO_CONNECTION_ERROR ||
      response.error === AUTHORIZATION_FAILED_ERROR;

    return {
      message: needsConnection
        ? 'Connect your Google Tasks account to send tasks.'
        : 'Could not send the tasks to Google Tasks.',
      variant: 'error',
    };
  }

  if (response.hasFailures === true) {
    return {
      message: 'Some tasks could not be sent to Google Tasks.',
      variant: 'error',
    };
  }

  return {
    message: 'Tasks sent to Google Tasks.',
    variant: 'success',
  };
};

export const requestTasksPush = async ({
  taskIds,
}: {
  taskIds: string[];
}): Promise<void> => {
  if (taskIds.length === 0) {
    return;
  }

  try {
    const response = await new RestApiClient().post<PushTasksResponse>(
      `/s${PUSH_TASKS_ROUTE_PATH}`,
      { taskIds },
    );

    await enqueueSnackbar(buildSnackbarForResponse(response ?? {}));
  } catch {
    await enqueueSnackbar({
      message: 'Could not send the tasks to Google Tasks.',
      variant: 'error',
    });
  }
};
