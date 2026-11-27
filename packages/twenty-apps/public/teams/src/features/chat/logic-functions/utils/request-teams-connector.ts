import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-idempotent-retryable-statuses';
import { TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS } from 'src/features/chat/logic-functions/constants/teams-connector-request-max-attempts';
import { TEAMS_CONNECTOR_REQUEST_TIMEOUT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-request-timeout-ms';
import { TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-max-total-wait-ms';
import { TEAMS_CONNECTOR_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-retryable-statuses';
import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { TeamsConnectorRequestError } from 'src/features/chat/logic-functions/types/teams-connector-request-error';
import { getTeamsConnectorRetryDelayMs } from 'src/features/chat/logic-functions/utils/get-teams-connector-retry-delay-ms';
import { isTeamsConnectorServiceUrl } from 'src/features/chat/logic-functions/utils/is-teams-connector-service-url';
import { normalizeTeamsServiceUrl } from 'src/features/chat/logic-functions/utils/normalize-teams-service-url';
import { fetchWithRetries } from 'src/utils/fetch-with-retries';

export const requestTeamsConnector = async ({
  serviceUrl,
  path,
  method,
  accessToken,
  body,
  retryAbortSignal,
}: {
  serviceUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  accessToken: string;
  body?: TeamsActivity;
  retryAbortSignal?: AbortSignal;
}): Promise<string> => {
  const normalizedServiceUrl = normalizeTeamsServiceUrl(serviceUrl);

  if (!isTeamsConnectorServiceUrl(normalizedServiceUrl)) {
    throw new Error(
      `Refused to send the bot credentials to ${normalizedServiceUrl}, which is not a Bot Connector host`,
    );
  }

  const deadlineAtMs = Date.now() + TEAMS_CONNECTOR_REQUEST_TIMEOUT_MS;

  const response = await fetchWithRetries({
    sendRequest: () =>
      fetch(`${normalizedServiceUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          ...(isDefined(body) ? { 'content-type': 'application/json' } : {}),
        },
        ...(isDefined(body) ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
      }),
    maxAttempts: TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS,
    isRetryableStatus: (status) =>
      TEAMS_CONNECTOR_RETRYABLE_STATUSES.has(status) ||
      (method !== 'POST' &&
        TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES.has(status)),
    getRetryDelayMs: ({ attempt, retryAfterMs, waitedMs }) => {
      const delayMs = getTeamsConnectorRetryDelayMs({
        attempt,
        retryAfterMs,
        maxDelayMs: TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS - waitedMs,
      });

      return delayMs <= 0 || Date.now() + delayMs >= deadlineAtMs
        ? undefined
        : delayMs;
    },
    retryAbortSignal,
  });

  const responseBody = await response.text();

  if (response.ok) {
    return responseBody;
  }

  throw new TeamsConnectorRequestError({
    message: `Bot Connector ${method} ${path} failed: ${response.status} ${response.statusText}${isNonEmptyString(responseBody) ? ` - ${responseBody}` : ''}`,
    status: response.status,
  });
};
