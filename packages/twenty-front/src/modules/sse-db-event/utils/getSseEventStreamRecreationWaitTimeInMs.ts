import { SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseConnectionRetryMaxWaitTimeInMs';
import { SSE_EVENT_STREAM_RECREATION_BASE_WAIT_TIME_IN_MS } from '@/sse-db-event/constants/SseEventStreamRecreationBaseWaitTimeInMs';

export const getSseEventStreamRecreationWaitTimeInMs = (
  shortLivedStreamCount: number,
): number => {
  if (shortLivedStreamCount === 0) {
    return 0;
  }

  const maximumWaitTimeInMs = Math.min(
    SSE_EVENT_STREAM_RECREATION_BASE_WAIT_TIME_IN_MS *
      2 ** (shortLivedStreamCount - 1),
    SSE_CONNECTION_RETRY_MAX_WAIT_TIME_IN_MS,
  );

  // Half of the wait is random so tabs failing together don't retry together
  return maximumWaitTimeInMs / 2 + (Math.random() * maximumWaitTimeInMs) / 2;
};
