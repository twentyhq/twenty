import { BACKFILL_CALL_RECORDING_APPLICATION_IDS_ROUTE_PATH } from 'src/constants/backfill-call-recording-application-ids-route-path';
import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';

export const requestCallRecordingApplicationIdsBackfill =
  async (): Promise<boolean> =>
    postToOwnRoute({
      path: BACKFILL_CALL_RECORDING_APPLICATION_IDS_ROUTE_PATH,
      body: {},
    });
