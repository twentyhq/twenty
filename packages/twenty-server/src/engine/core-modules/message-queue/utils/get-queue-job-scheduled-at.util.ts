import { isDefined } from 'twenty-shared/utils';

// Jobs enqueued before scheduledAt was stored fall back to their insertion options
export const getQueueJobScheduledAt = ({
  timestamp,
  options,
}: {
  timestamp: number;
  options: { scheduledAt?: number; delay?: number };
}): number =>
  isDefined(options.scheduledAt)
    ? options.scheduledAt
    : timestamp + (options.delay ?? 0);
