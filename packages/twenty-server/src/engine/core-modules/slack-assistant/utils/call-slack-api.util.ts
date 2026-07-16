import { type SlackApiResponse } from 'src/engine/core-modules/slack-assistant/types/slack-api-response.type';

const SLACK_API_BASE_URL = 'https://slack.com/api/';

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
    if (value === undefined || value === null) {
      continue;
    }

    body.set(key, encodeValue(value));
  }

  const response = await fetch(new URL(method, SLACK_API_BASE_URL), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const payload = (await response.json()) as TResponse;

  if (!response.ok) {
    throw new Error(`Slack ${method} returned HTTP ${response.status}`);
  }

  return payload;
};
