import { isUndefined } from '@sniptt/guards';

import { getTimestamp } from 'src/front-components/utils/get-timestamp.util';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

export const formatCallRecordingDuration = ({
  startedAt,
  endedAt,
}: {
  startedAt: string | null | undefined;
  endedAt: string | null | undefined;
}): string | undefined => {
  const startTimestamp = getTimestamp(startedAt);
  const endTimestamp = getTimestamp(endedAt);

  if (isUndefined(startTimestamp) || isUndefined(endTimestamp)) {
    return undefined;
  }

  const durationInSeconds = Math.round((endTimestamp - startTimestamp) / 1000);

  if (durationInSeconds < 0) {
    return undefined;
  }

  if (durationInSeconds < SECONDS_PER_MINUTE) {
    return `${durationInSeconds}s`;
  }

  if (durationInSeconds < SECONDS_PER_HOUR) {
    return `${Math.floor(durationInSeconds / SECONDS_PER_MINUTE)}m`;
  }

  const hours = Math.floor(durationInSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (durationInSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );

  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};
