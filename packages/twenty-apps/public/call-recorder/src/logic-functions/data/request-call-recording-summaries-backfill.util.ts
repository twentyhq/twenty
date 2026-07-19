import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { postToOwnRoute } from 'src/logic-functions/data/post-to-own-route.util';

export const requestCallRecordingSummariesBackfill =
  async (): Promise<boolean> =>
    postToOwnRoute({
      path: GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
      body: {},
    });
