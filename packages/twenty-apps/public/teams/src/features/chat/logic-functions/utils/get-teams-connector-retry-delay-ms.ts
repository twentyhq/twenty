import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-base-delay-ms';
import { TEAMS_CONNECTOR_RETRY_JITTER_RATIO } from 'src/features/chat/logic-functions/constants/teams-connector-retry-jitter-ratio';

export const getTeamsConnectorRetryDelayMs = ({
  attempt,
  retryAfterMs,
  maxDelayMs,
}: {
  attempt: number;
  retryAfterMs: number | undefined;
  maxDelayMs: number;
}): number => {
  if (isDefined(retryAfterMs)) {
    const delayMs = Math.max(retryAfterMs, TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS);

    return delayMs > maxDelayMs ? 0 : delayMs;
  }

  const backoffMs = TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS * 2 ** attempt;

  return Math.min(
    backoffMs * (1 + Math.random() * TEAMS_CONNECTOR_RETRY_JITTER_RATIO),
    maxDelayMs,
  );
};
