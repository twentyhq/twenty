import { isDefined } from 'twenty-shared/utils';

// Pin a major version so silent API changes can't break workflow steps.
// Discord's docs strongly recommend explicit version pinning; unversioned
// URLs auto-track the latest version and risk breakage at any time.
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';

type DiscordApiSuccess<TData> = {
  ok: true;
  status: number;
  data: TData;
};

type DiscordApiFailure = {
  ok: false;
  status: number;
  errorMessage: string;
};

export type DiscordApiResult<TData> = DiscordApiSuccess<TData> | DiscordApiFailure;

type DiscordErrorBody = {
  code?: number;
  message?: string;
};

type DiscordApiRequestParams = {
  botToken: string;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
};

// All Discord REST calls go through here so authorization, base URL, error
// shape parsing, and JSON content-type handling stay consistent across
// handlers. Discord auths bots with `Authorization: Bot <token>` — the `Bot `
// prefix is required, not the `Bearer` prefix used for OAuth tokens.
export const discordApiRequest = async <TData = unknown>({
  botToken,
  path,
  method,
  body,
}: DiscordApiRequestParams): Promise<DiscordApiResult<TData>> => {
  const url = `${DISCORD_API_BASE_URL}${path}`;
  const hasBody = isDefined(body);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bot ${botToken}`,
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    return {
      ok: false,
      status: 0,
      errorMessage: `Discord API request failed: ${(error as Error).message}`,
    };
  }

  // 204 No Content from PUT reactions and DELETE message — no body to parse.
  if (response.status === 204) {
    return { ok: true, status: 204, data: undefined as TData };
  }

  if (!response.ok) {
    const errorMessage = await extractDiscordErrorMessage(response);

    return {
      ok: false,
      status: response.status,
      errorMessage,
    };
  }

  try {
    const data = (await response.json()) as TData;

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Discord API returned a non-JSON response: ${(error as Error).message}`,
    };
  }
};

const extractDiscordErrorMessage = async (
  response: Response,
): Promise<string> => {
  const fallback = `Discord API responded with ${response.status}`;

  try {
    const errorBody = (await response.json()) as DiscordErrorBody;

    if (isDefined(errorBody.message)) {
      return isDefined(errorBody.code)
        ? `${errorBody.message} (Discord error code ${errorBody.code})`
        : errorBody.message;
    }

    return fallback;
  } catch {
    return fallback;
  }
};
