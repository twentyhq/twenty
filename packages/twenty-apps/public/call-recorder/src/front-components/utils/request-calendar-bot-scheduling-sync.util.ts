import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';

type SyncCalendarBotSchedulingResponse = {
  outcome?: string;
  canceledCallRecordingIds?: string[];
  failedCallRecordingIds?: string[];
};

const buildSnackbarForResponse = (
  response: SyncCalendarBotSchedulingResponse,
): { message: string; variant: 'success' | 'error' } | undefined => {
  if (response.outcome === 'sweep-enqueued') {
    return undefined;
  }

  const canceledCount = (response.canceledCallRecordingIds ?? []).length;
  const failedCount = (response.failedCallRecordingIds ?? []).length;

  if (failedCount > 0) {
    return {
      message: `Could not cancel ${failedCount} scheduled recording${failedCount === 1 ? '' : 's'}.`,
      variant: 'error',
    };
  }

  if (canceledCount === 0) {
    return undefined;
  }

  return {
    message: `Canceled ${canceledCount} scheduled recording${canceledCount === 1 ? '' : 's'}.`,
    variant: 'success',
  };
};

// The application variable must already be saved: the route reads it to
// decide whether to cancel scheduled bots or sweep upcoming meetings.
export const requestCalendarBotSchedulingSync = async (): Promise<void> => {
  try {
    const response =
      await new RestApiClient().post<SyncCalendarBotSchedulingResponse>(
        `/s${SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH}`,
        {},
      );

    const snackbar = buildSnackbarForResponse(response ?? {});

    if (snackbar !== undefined) {
      await enqueueSnackbar(snackbar);
    }
  } catch {
    await enqueueSnackbar({
      message:
        'Setting saved, but scheduled recordings could not be updated yet.',
      variant: 'error',
    });
  }
};
