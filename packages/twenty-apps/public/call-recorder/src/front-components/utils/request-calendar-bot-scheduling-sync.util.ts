import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH } from 'src/constants/sync-calendar-bot-scheduling-route-path';

export const requestCalendarBotSchedulingSync = async (): Promise<void> => {
  try {
    await new RestApiClient().post(
      `/s${SYNC_CALENDAR_BOT_SCHEDULING_ROUTE_PATH}`,
      {},
    );
  } catch {
    await enqueueSnackbar({
      message:
        'Setting saved, but scheduled recordings could not be updated yet.',
      variant: 'error',
    });
  }
};
