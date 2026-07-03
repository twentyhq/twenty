import { RestApiClient } from 'twenty-client-sdk/rest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';

const BACKFILL_KICKOFF_FLUSH_MS = 5_000;

export const requestCallRecordingSummariesBackfill =
  async (): Promise<boolean> => {
    const client = new RestApiClient();

    try {
      await client.post(
        `/s${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
        {},
        { signal: AbortSignal.timeout(BACKFILL_KICKOFF_FLUSH_MS) },
      );

      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError')
      ) {
        return true;
      }

      if (process.env.NODE_ENV !== 'test') {
        console.error(
          `[call-recorder] summary backfill kickoff failed to fire: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      return false;
    }
  };
