import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';

type RecallBotOperationSuccess = {
  ok: true;
  externalBotId: string | null;
};

type RecallBotOperationFailure = {
  ok: false;
  status: number | null;
  errorMessage: string;
};

type RecallBotOperationResult =
  | RecallBotOperationSuccess
  | RecallBotOperationFailure;

type RecallBotResponse = {
  id?: unknown;
  bot_id?: unknown;
};

type RecallBotMetadata = {
  twentyCallRecordingId: string;
  twentyCalendarEventId: string;
  twentyRealMeetingKey: string;
};

type ScheduleRecallRecordingBotArgs = {
  meetingUrl: string;
  joinAt: string;
  metadata: RecallBotMetadata;
};

type RescheduleRecallRecordingBotArgs = ScheduleRecallRecordingBotArgs & {
  externalBotId: string;
};

export const scheduleRecallRecordingBot = async ({
  meetingUrl,
  joinAt,
  metadata,
}: ScheduleRecallRecordingBotArgs): Promise<RecallBotOperationResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<RecallBotResponse>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: '/bot/',
    method: 'POST',
    body: {
      meeting_url: meetingUrl,
      join_at: joinAt,
      bot_name: configResult.config.botName,
      metadata,
    },
  });

  if (!result.ok) {
    return result;
  }

  const externalBotId = extractRecallBotId(result.data);

  if (externalBotId === null) {
    return {
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a bot but the response did not include a bot id',
    };
  }

  return {
    ok: true,
    externalBotId,
  };
};

export const rescheduleRecallRecordingBot = async ({
  externalBotId,
  meetingUrl,
  joinAt,
  metadata,
}: RescheduleRecallRecordingBotArgs): Promise<RecallBotOperationResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<RecallBotResponse>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/bot/${externalBotId}/`,
    method: 'PATCH',
    body: {
      meeting_url: meetingUrl,
      join_at: joinAt,
      bot_name: configResult.config.botName,
      metadata,
    },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    externalBotId: extractRecallBotId(result.data) ?? externalBotId,
  };
};

export const cancelRecallRecordingBot = async ({
  externalBotId,
}: {
  externalBotId: string;
}): Promise<RecallBotOperationResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<undefined>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/bot/${externalBotId}/`,
    method: 'DELETE',
    allowNotFound: true,
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    externalBotId: null,
  };
};

const recallBotApiRequest = async <TData>({
  apiKey,
  baseUrl,
  path,
  method,
  body,
  allowNotFound = false,
}: {
  apiKey: string;
  baseUrl: string;
  path: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  allowNotFound?: boolean;
}): Promise<
  | {
      ok: true;
      status: number;
      data: TData;
    }
  | {
      ok: false;
      status: number | null;
      errorMessage: string;
    }
> => {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: buildRecallApiAuthorizationHeader(apiKey),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    return {
      ok: false,
      status: null,
      errorMessage: `Recall API request failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  if (allowNotFound && response.status === 404) {
    return {
      ok: true,
      status: response.status,
      data: undefined as TData,
    };
  }

  if (response.status === 204) {
    return {
      ok: true,
      status: response.status,
      data: undefined as TData,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: await extractRecallApiErrorMessage(response),
    };
  }

  try {
    return {
      ok: true,
      status: response.status,
      data: (await response.json()) as TData,
    };
  } catch (error) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Recall API returned a non-JSON response: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

const buildRecallApiAuthorizationHeader = (apiKey: string): string => {
  const trimmedApiKey = apiKey.trim();

  return trimmedApiKey.toLowerCase().startsWith('token ')
    ? trimmedApiKey
    : `Token ${trimmedApiKey}`;
};

const extractRecallApiErrorMessage = async (
  response: Response,
): Promise<string> => {
  const fallback = `Recall API responded with HTTP ${response.status}`;

  try {
    const body = (await response.json()) as unknown;

    return `${fallback}: ${JSON.stringify(body)}`;
  } catch {
    return fallback;
  }
};

const extractRecallBotId = (
  response: RecallBotResponse | undefined,
): string | null => {
  if (typeof response?.id === 'string') {
    return response.id;
  }

  if (typeof response?.bot_id === 'string') {
    return response.bot_id;
  }

  return null;
};
