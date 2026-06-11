import { RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS } from 'src/logic-functions/constants/recall-bot-noone-joined-timeout-seconds';
import { RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS } from 'src/logic-functions/constants/recall-bot-waiting-room-timeout-seconds';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';

const RECALL_BOT_AUTOMATIC_LEAVE = {
  waiting_room_timeout: RECALL_BOT_WAITING_ROOM_TIMEOUT_SECONDS,
  noone_joined_timeout: RECALL_BOT_NOONE_JOINED_TIMEOUT_SECONDS,
};

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
  // Workspace dispatch key for a future host-level webhook ingress.
  twentyApplicationId?: string;
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
      automatic_leave: RECALL_BOT_AUTOMATIC_LEAVE,
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
      automatic_leave: RECALL_BOT_AUTOMATIC_LEAVE,
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

export const ejectRecallRecordingBot = async ({
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
    path: `/bot/${externalBotId}/leave_call/`,
    method: 'POST',
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

type GetRecallBotResult =
  | { ok: true; bot: Record<string, unknown> }
  | RecallBotOperationFailure;

export const getRecallBot = async ({
  externalBotId,
}: {
  externalBotId: string;
}): Promise<GetRecallBotResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<Record<string, unknown>>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/bot/${externalBotId}/`,
    method: 'GET',
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, bot: result.data ?? {} };
};

type CreateAsyncRecallTranscriptResult =
  | { ok: true; transcriptId: string }
  | RecallBotOperationFailure;

export const createAsyncRecallTranscript = async ({
  externalRecordingId,
}: {
  externalRecordingId: string;
}): Promise<CreateAsyncRecallTranscriptResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<{ id?: unknown }>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/recording/${externalRecordingId}/create_transcript/`,
    method: 'POST',
    body: {
      provider: { recallai_async: { language_code: 'auto' } },
      diarization: { use_separate_streams_when_available: true },
    },
  });

  if (!result.ok) {
    return result;
  }

  if (typeof result.data?.id !== 'string') {
    return {
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a transcript but the response did not include a transcript id',
    };
  }

  return { ok: true, transcriptId: result.data.id };
};

export type RecallTranscriptDetails = {
  downloadUrl: string | null;
  statusCode: string | null;
  statusSubCode: string | null;
};

type RetrieveRecallTranscriptResult =
  | { ok: true; transcript: RecallTranscriptDetails }
  | RecallBotOperationFailure;

export const retrieveRecallTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<RetrieveRecallTranscriptResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<Record<string, unknown>>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/transcript/${transcriptId}/`,
    method: 'GET',
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, transcript: extractRecallTranscriptDetails(result.data) };
};

const extractRecallTranscriptDetails = (
  response: Record<string, unknown> | undefined,
): RecallTranscriptDetails => {
  const data = asNestedRecord(response?.data);
  const status = asNestedRecord(response?.status);

  return {
    downloadUrl: asNestedString(data?.download_url),
    statusCode: asNestedString(status?.code),
    statusSubCode: asNestedString(status?.sub_code),
  };
};

const asNestedRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asNestedString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

export type RecallScheduledBot = {
  id: string;
  metadata: Record<string, unknown>;
};

type RecallBotListResponse = {
  next?: unknown;
  results?: unknown;
};

type ListScheduledRecallBotsResult =
  | { ok: true; bots: RecallScheduledBot[] }
  | RecallBotOperationFailure;

const RECALL_BOT_LIST_MAX_PAGES = 10;

export const listScheduledRecallBots = async ({
  joinAtAfter,
  joinAtBefore,
}: {
  joinAtAfter: string;
  joinAtBefore: string;
}): Promise<ListScheduledRecallBotsResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const bots: RecallScheduledBot[] = [];
  let path: string | null = `/bot/?join_at_after=${encodeURIComponent(
    joinAtAfter,
  )}&join_at_before=${encodeURIComponent(joinAtBefore)}`;

  for (
    let pageIndex = 0;
    path !== null && pageIndex < RECALL_BOT_LIST_MAX_PAGES;
    pageIndex++
  ) {
    const result = await recallBotApiRequest<RecallBotListResponse>({
      apiKey: configResult.config.apiKey,
      baseUrl: configResult.config.baseUrl,
      path,
      method: 'GET',
    });

    if (!result.ok) {
      return result;
    }

    bots.push(...extractRecallBots(result.data));
    path = extractNextPath(result.data, configResult.config.baseUrl);
  }

  return { ok: true, bots };
};

const extractRecallBots = (
  response: RecallBotListResponse | undefined,
): RecallScheduledBot[] => {
  if (!Array.isArray(response?.results)) {
    return [];
  }

  return response.results.flatMap((candidate: unknown) => {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      typeof (candidate as { id?: unknown }).id !== 'string'
    ) {
      return [];
    }

    const metadata = (candidate as { metadata?: unknown }).metadata;

    return [
      {
        id: (candidate as { id: string }).id,
        metadata:
          typeof metadata === 'object' && metadata !== null
            ? (metadata as Record<string, unknown>)
            : {},
      },
    ];
  });
};

const extractNextPath = (
  response: RecallBotListResponse | undefined,
  baseUrl: string,
): string | null => {
  const next = response?.next;

  if (typeof next !== 'string' || !next.startsWith(baseUrl)) {
    return null;
  }

  return next.slice(baseUrl.length);
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
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
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
