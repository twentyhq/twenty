import { SSE_EVENT_STREAM_HEALTHY_LIFETIME_IN_MS } from '@/sse-db-event/constants/SseEventStreamHealthyLifetimeInMs';
import { isDefined } from 'twenty-shared/utils';

export const getNextSseEventStreamShortLivedCount = ({
  shortLivedStreamCount,
  createdAtTimestamp,
  destroyedAtTimestamp,
}: {
  shortLivedStreamCount: number;
  createdAtTimestamp: number | null;
  destroyedAtTimestamp: number;
}): number => {
  const wasShortLived =
    isDefined(createdAtTimestamp) &&
    destroyedAtTimestamp - createdAtTimestamp <
      SSE_EVENT_STREAM_HEALTHY_LIFETIME_IN_MS;

  return wasShortLived ? shortLivedStreamCount + 1 : 0;
};
