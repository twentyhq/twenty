const SLACK_API_BASE_URL = 'https://slack.com/api/';

export type SlackApiResponse = {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
};

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

export const postSlackMessage = async ({
  token,
  channel,
  threadTs,
  markdownText,
}: {
  token: string;
  channel: string;
  threadTs?: string;
  markdownText: string;
}): Promise<void> => {
  const response = await callSlackApi(
    'chat.postMessage',
    {
      channel,
      thread_ts: threadTs,
      markdown_text: markdownText,
    },
    token,
  );

  if (response.ok !== true) {
    throw new Error(
      `Slack chat.postMessage failed: ${response.error ?? 'unknown_error'}`,
    );
  }
};
