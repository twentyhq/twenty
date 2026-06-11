import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { downloadRecallTranscript } from 'src/logic-functions/utils/download-recall-transcript.util';
import { extractRecallBotConvergence } from 'src/logic-functions/utils/extract-recall-bot-convergence.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/utils/is-call-recording-status-downgrade.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/utils/map-recall-status-code-to-call-recording-status.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/utils/normalize-recall-timestamp.util';
import { getRecallBot } from 'src/logic-functions/utils/recall-bot-api.util';
import {
  buildFailedRecallTranscriptMarker,
  parseRecallTranscriptMarker,
} from 'src/logic-functions/utils/recall-transcript-marker.util';
import { requestRecallTranscript } from 'src/logic-functions/utils/request-recall-transcript.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/utils/update-call-recording.util';

type RecallWebhookBody = {
  event?: unknown;
  type?: unknown;
  data?: unknown;
  bot?: unknown;
};

type MatchedCallRecording = {
  id: string;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  externalRecordingId?: string | null;
  transcript?: unknown;
};

type RecallWebhookHandlerResult =
  | {
      status: 'updated';
      callRecordingId: string;
      event: string;
      callRecordingStatus: string;
    }
  | {
      status: 'updated';
      callRecordingId: string;
      event: string;
      transcriptOutcome: 'FILLED' | 'FAILED';
    }
  | {
      status: 'skipped';
      event: string | null;
      reason: string;
    };

export const handleRecallWebhook = async ({
  client,
  body,
}: {
  client: CoreApiClient;
  body: RecallWebhookBody;
}): Promise<RecallWebhookHandlerResult> => {
  const event = getString(body.event) ?? getString(body.type);

  if (event === undefined) {
    return {
      status: 'skipped',
      event: null,
      reason: 'missing event type',
    };
  }

  // Transcript lifecycle events must never reach the bot-status mapping; they
  // carry no status code and would otherwise trip the downgrade guard.
  if (event === 'transcript.done' || event === 'transcript.failed') {
    return handleRecallTranscriptEvent({ client, body, event });
  }

  const statusCode = getRecallStatusCode({ body, event });
  const callRecordingStatus = mapRecallEventToCallRecordingStatus({
    event,
    statusCode,
  });

  if (callRecordingStatus === undefined) {
    return {
      status: 'skipped',
      event,
      reason: `unsupported Recall event status ${statusCode ?? event}`,
    };
  }

  const externalBotId = getExternalBotId(body);
  const callRecording = await findMatchingCallRecording({
    client,
    body,
    externalBotId,
  });

  if (callRecording === null) {
    return {
      status: 'skipped',
      event,
      reason: 'no matching call recording',
    };
  }

  if (
    isCallRecordingStatusDowngrade({
      fromStatus: callRecording.status,
      toStatus: callRecordingStatus,
    })
  ) {
    return {
      status: 'skipped',
      event,
      reason: `stale status event (${callRecording.status} -> ${callRecordingStatus})`,
    };
  }

  const updateData: CallRecordingUpdateFields = {
    status: callRecordingStatus,
    ...(externalBotId === undefined ? {} : { externalBotId }),
    ...buildExternalRecordingIdUpdate(body),
    ...buildRecordingTimestampsUpdate({
      body,
      event,
      statusCode,
      callRecording,
    }),
  };

  if (
    callRecordingStatus === CallRecordingStatus.COMPLETED &&
    isTranscriptUnset(callRecording)
  ) {
    Object.assign(
      updateData,
      await buildTranscriptRequestUpdate({
        callRecording,
        externalBotId,
        externalRecordingIdFromEvent: updateData.externalRecordingId,
      }),
    );
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: updateData,
  });

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    callRecordingStatus,
  };
};

const findMatchingCallRecording = async ({
  client,
  body,
  externalBotId,
}: {
  client: CoreApiClient;
  body: RecallWebhookBody;
  externalBotId: string | undefined;
}): Promise<MatchedCallRecording | null> => {
  const callRecordingIdFromMetadata = getCallRecordingIdFromMetadata(body);

  if (callRecordingIdFromMetadata !== null) {
    return findCallRecordingByFilter(client, {
      id: { eq: callRecordingIdFromMetadata },
    });
  }

  if (externalBotId === undefined) {
    return null;
  }

  return findCallRecordingByFilter(client, {
    externalBotId: { eq: externalBotId },
  });
};

const findCallRecordingByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<MatchedCallRecording | null> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter,
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          externalRecordingId: true,
          transcript: true,
        },
      },
    },
  });

  return queryResult.callRecordings?.edges?.[0]?.node ?? null;
};

const getRecallStatusCode = ({
  body,
  event,
}: {
  body: RecallWebhookBody;
  event: string;
}): string | undefined => {
  const data = asRecord(body.data);

  return (
    getString(getRecordAtPath(data, ['status', 'code'])) ??
    getString(getRecordAtPath(data, ['data', 'code'])) ??
    getString(getRecordAtPath(asRecord(body.bot), ['status', 'code'])) ??
    getStatusCodeFromEvent(event)
  );
};

const getStatusCodeFromEvent = (event: string): string | undefined => {
  if (!event.startsWith('bot.')) {
    return undefined;
  }

  const statusCode = event.slice('bot.'.length);

  return statusCode === 'status_change' ? undefined : statusCode;
};

const mapRecallEventToCallRecordingStatus = ({
  event,
  statusCode,
}: {
  event: string;
  statusCode: string | undefined;
}): CallRecordingStatus | undefined => {
  if (event === 'recording.done') {
    return CallRecordingStatus.COMPLETED;
  }

  if (event === 'recording.failed') {
    return CallRecordingStatus.FAILED_UNKNOWN;
  }

  return mapRecallStatusCodeToCallRecordingStatus(statusCode);
};

// startedAt/endedAt record ACTUAL recording times; a redelivered or stale
// event must never overwrite a value that an earlier event already set.
// Recording-object timestamps are preferred over status-change timestamps so
// the webhook and the backstop pull path converge to identical values.
const buildRecordingTimestampsUpdate = ({
  body,
  event,
  statusCode,
  callRecording,
}: {
  body: RecallWebhookBody;
  event: string;
  statusCode: string | undefined;
  callRecording: MatchedCallRecording;
}): { startedAt?: string; endedAt?: string } => {
  const data = asRecord(body.data);
  const statusTimestamp = getRecallStatusTimestamp(body);

  const impliesRecordingStarted = statusCode === 'in_call_recording';
  const impliesRecordingEnded =
    event === 'recording.done' ||
    statusCode === 'call_ended' ||
    statusCode === 'done';

  const startedAt = normalizeRecallTimestamp(
    getString(getRecordAtPath(data, ['recording', 'started_at'])) ??
      (impliesRecordingStarted ? statusTimestamp : undefined),
  );
  const endedAt = normalizeRecallTimestamp(
    getString(getRecordAtPath(data, ['recording', 'completed_at'])) ??
      (impliesRecordingEnded ? statusTimestamp : undefined),
  );

  return {
    ...(startedAt !== undefined &&
    getString(callRecording.startedAt) === undefined
      ? { startedAt }
      : {}),
    ...(endedAt !== undefined && getString(callRecording.endedAt) === undefined
      ? { endedAt }
      : {}),
  };
};

const getRecallStatusTimestamp = (
  body: RecallWebhookBody,
): string | undefined => {
  const data = asRecord(body.data);

  return (
    getString(getRecordAtPath(data, ['status', 'created_at'])) ??
    getString(getRecordAtPath(data, ['data', 'updated_at'])) ??
    getString(getRecordAtPath(asRecord(body.bot), ['status', 'created_at']))
  );
};

const getCallRecordingIdFromMetadata = (
  body: RecallWebhookBody,
): string | null => {
  const data = asRecord(body.data);
  const recording = asRecord(data?.recording);
  const metadata =
    asRecord(asRecord(body.bot)?.metadata) ??
    asRecord(asRecord(data?.bot)?.metadata) ??
    asRecord(recording?.metadata) ??
    asRecord(data?.metadata);
  const callRecordingId = getString(metadata?.twentyCallRecordingId);

  return callRecordingId ?? null;
};

const getExternalBotId = (body: RecallWebhookBody): string | undefined => {
  const data = asRecord(body.data);

  return (
    getString(data?.bot_id) ??
    getString(getRecordAtPath(data, ['bot', 'id'])) ??
    getString(getRecordAtPath(data, ['recording', 'bot_id'])) ??
    getString(getRecordAtPath(data, ['recording', 'bot', 'id'])) ??
    getString(getRecordAtPath(asRecord(body.bot), ['id']))
  );
};

const buildExternalRecordingIdUpdate = (
  body: RecallWebhookBody,
): { externalRecordingId?: string } => {
  const data = asRecord(body.data);
  const externalRecordingId =
    getString(getRecordAtPath(data, ['status', 'recording_id'])) ??
    getString(getRecordAtPath(data, ['recording', 'id'])) ??
    getString(data?.recording_id);

  return externalRecordingId === undefined ? {} : { externalRecordingId };
};

const isTranscriptUnset = (callRecording: MatchedCallRecording): boolean =>
  callRecording.transcript === null || callRecording.transcript === undefined;

const buildTranscriptRequestUpdate = async ({
  callRecording,
  externalBotId,
  externalRecordingIdFromEvent,
}: {
  callRecording: MatchedCallRecording;
  externalBotId: string | undefined;
  externalRecordingIdFromEvent: string | null | undefined;
}): Promise<CallRecordingUpdateFields> => {
  const externalRecordingId =
    getString(externalRecordingIdFromEvent) ??
    getString(callRecording.externalRecordingId) ??
    (externalBotId === undefined
      ? undefined
      : await fetchExternalRecordingIdFromRecallBot(externalBotId));

  if (externalRecordingId === undefined) {
    console.warn(
      `[recall-recording-bot] cannot request transcript for call recording ${callRecording.id}: no Recall recording id available`,
    );

    return {};
  }

  const transcriptMarker = await requestRecallTranscript({
    externalRecordingId,
    requestedAt: new Date().toISOString(),
  });

  if (transcriptMarker === null) {
    return {};
  }

  return {
    transcript: transcriptMarker,
    externalRecordingId,
  };
};

const fetchExternalRecordingIdFromRecallBot = async (
  externalBotId: string,
): Promise<string | undefined> => {
  const botResult = await getRecallBot({ externalBotId });

  if (!botResult.ok) {
    console.warn(
      `[recall-recording-bot] failed to fetch Recall bot ${externalBotId} while resolving a recording id: ${botResult.errorMessage}`,
    );

    return undefined;
  }

  return extractRecallBotConvergence(botResult.bot).externalRecordingId;
};

const handleRecallTranscriptEvent = async ({
  client,
  body,
  event,
}: {
  client: CoreApiClient;
  body: RecallWebhookBody;
  event: 'transcript.done' | 'transcript.failed';
}): Promise<RecallWebhookHandlerResult> => {
  const callRecording = await findMatchingCallRecording({
    client,
    body,
    externalBotId: getExternalBotId(body),
  });

  if (callRecording === null) {
    return {
      status: 'skipped',
      event,
      reason: 'no matching call recording',
    };
  }

  const transcriptId = getString(
    getRecordAtPath(asRecord(body.data), ['transcript', 'id']),
  );

  if (event === 'transcript.failed') {
    return applyRecallTranscriptFailure({
      client,
      callRecording,
      event,
      transcriptId,
      subCode:
        getString(
          getRecordAtPath(asRecord(body.data), ['status', 'sub_code']),
        ) ?? null,
    });
  }

  if (transcriptId === undefined) {
    return {
      status: 'skipped',
      event,
      reason: 'missing transcript id',
    };
  }

  const downloadResult = await downloadRecallTranscript({ transcriptId });

  switch (downloadResult.outcome) {
    case 'filled':
      await updateCallRecording(client, {
        id: callRecording.id,
        data: {
          transcript: downloadResult.content as Record<string, unknown>,
          ...(getString(callRecording.externalRecordingId) === undefined
            ? buildExternalRecordingIdUpdate(body)
            : {}),
        },
      });

      return {
        status: 'updated',
        event,
        callRecordingId: callRecording.id,
        transcriptOutcome: 'FILLED',
      };
    case 'failed':
      return applyRecallTranscriptFailure({
        client,
        callRecording,
        event,
        transcriptId,
        subCode: downloadResult.subCode,
      });
    case 'pending':
    case 'error': {
      // Webhooks are 200-acked either way, so Svix will not redeliver; the
      // backstop pending-marker re-check is what retries this download.
      const reason =
        downloadResult.outcome === 'pending'
          ? 'transcript not downloadable yet'
          : downloadResult.errorMessage;

      console.warn(
        `[recall-recording-bot] could not fill transcript for call recording ${callRecording.id}: ${reason}`,
      );

      return {
        status: 'skipped',
        event,
        reason,
      };
    }
  }
};

const applyRecallTranscriptFailure = async ({
  client,
  callRecording,
  event,
  transcriptId,
  subCode,
}: {
  client: CoreApiClient;
  callRecording: MatchedCallRecording;
  event: string;
  transcriptId: string | undefined;
  subCode: string | null;
}): Promise<RecallWebhookHandlerResult> => {
  const existingMarker = parseRecallTranscriptMarker(callRecording.transcript);

  if (!isTranscriptUnset(callRecording) && existingMarker === null) {
    return {
      status: 'skipped',
      event,
      reason: 'transcript already filled',
    };
  }

  console.warn(
    `[recall-recording-bot] transcript failed for call recording ${callRecording.id}${subCode === null ? '' : ` (${subCode})`}`,
  );

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      transcript: buildFailedRecallTranscriptMarker({
        recallTranscriptId:
          transcriptId ?? existingMarker?.recallTranscriptId ?? null,
        subCode,
      }),
    },
  });

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    transcriptOutcome: 'FAILED',
  };
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
