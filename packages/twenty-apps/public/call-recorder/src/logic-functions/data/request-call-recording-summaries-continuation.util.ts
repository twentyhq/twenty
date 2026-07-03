import { RestApiClient } from 'twenty-client-sdk/rest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';

const CONTINUATION_FLUSH_MS = 5_000;

export const requestCallRecordingSummariesContinuation = async ({
  callRecordingIds,
}: {
  callRecordingIds: string[];
}): Promise<boolean> => {
  const client = new RestApiClient();

  try {
    await client.post(
      `/s${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
      { callRecordingIds },
      { signal: AbortSignal.timeout(CONTINUATION_FLUSH_MS) },
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
        `[call-recorder] summary generation continuation failed to fire: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return false;
  }
};
