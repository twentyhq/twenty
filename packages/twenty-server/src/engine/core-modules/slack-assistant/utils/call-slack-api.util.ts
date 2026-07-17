import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';

const SLACK_API_BASE_URL = 'https://slack.com/api/';

const SLACK_API_TIMEOUT_MS = 10_000;

const encodeValue = (value: unknown): string =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean'
    ? String(value)
    : JSON.stringify(value);

export const callSlackApi = async <
  TResponse extends SlackApiResponse = SlackApiResponse,
>(
  method: string,
  params: Record<string, unknown>,
  token: string,
): Promise<TResponse> => {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!isDefined(value)) {
      continue;
    }

    body.set(key, encodeValue(value));
  }

  const response = await axios.post<TResponse>(
    `${SLACK_API_BASE_URL}${method}`,
    body,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      timeout: SLACK_API_TIMEOUT_MS,
    },
  );

  return response.data;
};
