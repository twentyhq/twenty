import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-idempotent-retryable-statuses';
import { TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS } from 'src/features/chat/logic-functions/constants/teams-connector-request-max-attempts';
import { TEAMS_CONNECTOR_REQUEST_TIMEOUT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-request-timeout-ms';
import { TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-base-delay-ms';
import { TEAMS_CONNECTOR_RETRY_JITTER_RATIO } from 'src/features/chat/logic-functions/constants/teams-connector-retry-jitter-ratio';
import { TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-max-total-wait-ms';
import { TEAMS_CONNECTOR_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-retryable-statuses';
import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { isTeamsConnectorServiceUrl } from 'src/features/chat/logic-functions/utils/is-teams-connector-service-url';
import { normalizeTeamsServiceUrl } from 'src/features/chat/logic-functions/utils/normalize-teams-service-url';
import { requestWithRetries } from 'src/utils/request-with-retries';

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

  const { ok, status, statusText, responseBody } = await requestWithRetries({
    sendRequest: async (timeoutSignal) => {
      const response = await fetch(`${normalizedServiceUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${accessToken}`,
          ...(isDefined(body) ? { 'content-type': 'application/json' } : {}),
        },
        ...(isDefined(body) ? { body: JSON.stringify(body) } : {}),
        signal: timeoutSignal,
      });

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        responseBody: await response.text(),
      };
    },
    isRetryableStatus: (responseStatus) =>
      TEAMS_CONNECTOR_RETRYABLE_STATUSES.has(responseStatus) ||
      (method !== 'POST' &&
        TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES.has(responseStatus)),
    maxAttempts: TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS,
    baseDelayMs: TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS,
    jitterRatio: TEAMS_CONNECTOR_RETRY_JITTER_RATIO,
    minRetryAfterDelayMs: TEAMS_CONNECTOR_RETRY_BASE_DELAY_MS,
    maxTotalWaitMs: TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS,
    timeoutMs: TEAMS_CONNECTOR_REQUEST_TIMEOUT_MS,
    shouldParseRetryAfterHttpDate: true,
    retryAbortSignal,
  });

  if (ok) {
    return responseBody;
  }

  throw new Error(
    `Bot Connector ${method} ${path} failed: ${status} ${statusText}${isNonEmptyString(responseBody) ? ` - ${responseBody}` : ''}`,
  );
};
