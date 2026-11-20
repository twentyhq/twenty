import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-base-delay-ms';
import { TEAMS_CONNECTOR_RETRY_JITTER_RATIO } from 'src/features/chat/logic-functions/constants/teams-connector-retry-jitter-ratio';
import { parseTeamsConnectorRetryAfterMs } from 'src/features/chat/logic-functions/utils/parse-teams-connector-retry-after-ms';

export const getTeamsConnectorRetryDelayMs = ({
  attempt,
  retryAfter,
  maxDelayMs,
}: {
  attempt: number;
  retryAfter: string | null | undefined;
  maxDelayMs: number;
}): number => {
  const retryAfterMs = parseTeamsConnectorRetryAfterMs(retryAfter);
  const backoffMs = TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS * 2 ** attempt;

  return Math.min(
    isDefined(retryAfterMs)
      ? Math.max(retryAfterMs, TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS)
      : backoffMs * (1 + Math.random() * TEAMS_CONNECTOR_RETRY_JITTER_RATIO),
    maxDelayMs,
  );
};
