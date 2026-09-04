import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';

type SyncCalendarBotSchedulingResponse = {
  outcome?: string;
  canceledCallRecordingCount?: number;
};

const buildSnackbarForResponse = (
  response: SyncCalendarBotSchedulingResponse,
): { message: string; variant: 'success' | 'error' } | undefined => {
  if (response.outcome === 'sweep-enqueued') {
    return undefined;
  }

  const canceledCount = response.canceledCallRecordingCount ?? 0;

  if (canceledCount === 0) {
    return undefined;
  }

  return {
    message: `Canceled ${canceledCount} scheduled recording${canceledCount === 1 ? '' : 's'}.`,
    variant: 'success',
  };
};

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
