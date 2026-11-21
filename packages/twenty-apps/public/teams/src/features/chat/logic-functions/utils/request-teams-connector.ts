import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-idempotent-retryable-statuses';
import { TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS } from 'src/features/chat/logic-functions/constants/teams-connector-request-max-attempts';
import { TEAMS_CONNECTOR_REQUEST_TIMEOUT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-request-timeout-ms';
import { TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS } from 'src/features/chat/logic-functions/constants/teams-connector-retry-max-total-wait-ms';
import { TEAMS_CONNECTOR_RETRYABLE_STATUSES } from 'src/features/chat/logic-functions/constants/teams-connector-retryable-statuses';
import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';
import { getTeamsConnectorRetryDelayMs } from 'src/features/chat/logic-functions/utils/get-teams-connector-retry-delay-ms';
import { isTeamsConnectorServiceUrl } from 'src/features/chat/logic-functions/utils/is-teams-connector-service-url';
import { normalizeTeamsServiceUrl } from 'src/features/chat/logic-functions/utils/normalize-teams-service-url';
import { sleepForMilliseconds } from 'src/features/transcripts/logic-functions/utils/sleep-for-milliseconds';

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

  const sendRequest = async ({
    attempt,
    waitedMs,
  }: {
    attempt: number;
    waitedMs: number;
  }): Promise<string> => {
    const response = await fetch(`${normalizedServiceUrl}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(isDefined(body) ? { 'content-type': 'application/json' } : {}),
      },
      ...(isDefined(body) ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1)),
    });

    const responseBody = await response.text();

    if (response.ok) {
      return responseBody;
    }

    const failure = new Error(
      `Bot Connector ${method} ${path} failed: ${response.status} ${response.statusText}${isNonEmptyString(responseBody) ? ` - ${responseBody}` : ''}`,
    );

    const isRetryable =
      TEAMS_CONNECTOR_RETRYABLE_STATUSES.has(response.status) ||
      (method !== 'POST' &&
        TEAMS_CONNECTOR_IDEMPOTENT_RETRYABLE_STATUSES.has(response.status));

    if (!isRetryable || attempt + 1 >= TEAMS_CONNECTOR_REQUEST_MAX_ATTEMPTS) {
      throw failure;
    }

    const delayMs = getTeamsConnectorRetryDelayMs({
      attempt,
      retryAfter: response.headers.get('retry-after'),
      maxDelayMs: TEAMS_CONNECTOR_RETRY_MAX_TOTAL_WAIT_MS - waitedMs,
    });

    if (delayMs <= 0 || Date.now() + delayMs >= deadlineAtMs) {
      throw failure;
    }

    await sleepForMilliseconds(delayMs);

    if (retryAbortSignal?.aborted === true) {
      throw failure;
    }

    return sendRequest({ attempt: attempt + 1, waitedMs: waitedMs + delayMs });
  };

  return sendRequest({ attempt: 0, waitedMs: 0 });
};
