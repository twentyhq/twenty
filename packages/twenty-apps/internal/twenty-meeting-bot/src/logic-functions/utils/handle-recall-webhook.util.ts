import {
  isArray,
  isNonEmptyArray,
  isNull,
  isObject,
  isUndefined,
} from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { buildFailedRecallTranscriptMarker } from 'src/logic-functions/utils/build-failed-recall-transcript-marker.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/utils/charge-completed-call-recording.util';
import { downloadRecallTranscript } from 'src/logic-functions/utils/download-recall-transcript.util';
import { extractRecallBotConvergence } from 'src/logic-functions/utils/extract-recall-bot-convergence.util';
import { getRecallBot } from 'src/logic-functions/utils/get-recall-bot.util';
import { ingestRecallMedia } from 'src/logic-functions/utils/ingest-recall-media.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/utils/is-call-recording-status-downgrade.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/utils/is-recall-recording-done-signal.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/utils/map-recall-status-code-to-call-recording-status.util';
import { normalizeRecallTimestamp } from 'src/logic-functions/utils/normalize-recall-timestamp.util';
import { parseRecallTranscriptMarker } from 'src/logic-functions/utils/parse-recall-transcript-marker.util';
import { requestRecallTranscript } from 'src/logic-functions/utils/request-recall-transcript.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/utils/should-complete-call-recording-ingestion.util';
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
  status?: string;
  startedAt?: string;
  endedAt?: string;
  externalRecordingId?: string;
  transcript?: unknown;
  audio?: FilesFieldValue;
  video?: FilesFieldValue;
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

  if (isUndefined(event)) {
    return {
      status: 'skipped',
      event: null,
      reason: 'missing event type',
    };
  }

  // Transcript events carry no status code and would trip the downgrade guard.
  if (event === 'transcript.done' || event === 'transcript.failed') {
    return handleRecallTranscriptEvent({ client, body, event });
  }

  const statusCode = getRecallStatusCode({ body, event });
  const callRecordingStatus = mapRecallEventToCallRecordingStatus({
    event,
    statusCode,
  });

  if (isUndefined(callRecordingStatus)) {
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

  if (isUndefined(callRecording)) {
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
    ...(isUndefined(externalBotId) ? {} : { externalBotId }),
    ...buildExternalRecordingIdUpdate(body),
    ...buildRecordingTimestampsUpdate({
      body,
      event,
      statusCode,
      callRecording,
    }),
  };

  if (isRecallRecordingDoneSignal({ event, statusCode })) {
    if (isTranscriptUnset(callRecording)) {
      const transcriptRequestUpdate = await buildTranscriptRequestUpdate({
        callRecording,
        externalBotId,
        externalRecordingIdFromEvent: updateData.externalRecordingId,
      });

      if (Object.keys(transcriptRequestUpdate).length > 0) {
        await updateCallRecording(client, {
          id: callRecording.id,
          data: transcriptRequestUpdate,
        });
        Object.assign(updateData, transcriptRequestUpdate);
      }
    }

    Object.assign(
      updateData,
      await buildMediaIngestionUpdate({
        callRecording,
        externalBotId,
        externalRecordingIdFromEvent: updateData.externalRecordingId,
      }),
    );
  }

  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current: callRecording,
    updateData,
  });

  if (completesIngestion) {
    updateData.status = CallRecordingStatus.COMPLETED;
  }

  await updateCallRecording(client, {
    id: callRecording.id,
    data: updateData,
  });

  if (completesIngestion) {
    await chargeCompletedCallRecording({
      callRecordingId: callRecording.id,
      startedAt: updateData.startedAt ?? callRecording.startedAt,
      endedAt: updateData.endedAt ?? callRecording.endedAt,
    });
  }

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    callRecordingStatus: updateData.status ?? callRecordingStatus,
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
}): Promise<MatchedCallRecording | undefined> => {
  const callRecordingIdFromMetadata = getCallRecordingIdFromMetadata(body);

  if (!isUndefined(callRecordingIdFromMetadata)) {
    return findCallRecordingByFilter(client, {
      id: { eq: callRecordingIdFromMetadata },
    });
  }

  if (isUndefined(externalBotId)) {
    return undefined;
  }

  return findCallRecordingByFilter(client, {
    externalBotId: { eq: externalBotId },
  });
};

const findCallRecordingByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<MatchedCallRecording | undefined> => {
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
          audio: { fileId: true },
          video: { fileId: true },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (isUndefined(node) || isNull(node)) {
    return undefined;
  }

  return {
    id: node.id,
    status: getString(node.status),
    startedAt: getString(node.startedAt),
    endedAt: getString(node.endedAt),
    externalRecordingId: getString(node.externalRecordingId),
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
  };
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
    return CallRecordingStatus.PROCESSING;
  }

  if (event === 'recording.failed') {
    return CallRecordingStatus.FAILED_UNKNOWN;
  }

  return mapRecallStatusCodeToCallRecordingStatus(statusCode);
};

// Never overwrite set actual times; recording timestamps align push and pull.
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
    ...(!isUndefined(startedAt) && isUndefined(callRecording.startedAt)
      ? { startedAt }
      : {}),
    ...(!isUndefined(endedAt) && isUndefined(callRecording.endedAt)
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
): string | undefined => {
  const data = asRecord(body.data);
  const recording = asRecord(data?.recording);
  const metadata =
    asRecord(asRecord(body.bot)?.metadata) ??
    asRecord(asRecord(data?.bot)?.metadata) ??
    asRecord(recording?.metadata) ??
    asRecord(data?.metadata);

  return getString(metadata?.twentyCallRecordingId);
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

  return isUndefined(externalRecordingId) ? {} : { externalRecordingId };
};

const isTranscriptUnset = (callRecording: MatchedCallRecording): boolean =>
  isUndefined(callRecording.transcript);

const buildMediaIngestionUpdate = async ({
  callRecording,
  externalBotId,
  externalRecordingIdFromEvent,
}: {
  callRecording: MatchedCallRecording;
  externalBotId: string | undefined;
  externalRecordingIdFromEvent: string | undefined;
}): Promise<Pick<CallRecordingUpdateFields, 'audio' | 'video'>> => {
  const hasAudio = isNonEmptyArray(callRecording.audio);
  const hasVideo = isNonEmptyArray(callRecording.video);

  if (hasAudio && hasVideo) {
    return {};
  }

  const externalRecordingId =
    externalRecordingIdFromEvent ??
    callRecording.externalRecordingId ??
    (isUndefined(externalBotId)
      ? undefined
      : await fetchExternalRecordingIdFromRecallBot(externalBotId));

  if (isUndefined(externalRecordingId)) {
    console.warn(
      `[recall-recording-bot] cannot ingest media for call recording ${callRecording.id}: no Recall recording id available`,
    );

    return {};
  }

  return ingestRecallMedia({
    callRecordingId: callRecording.id,
    externalRecordingId,
    hasAudio,
    hasVideo,
  });
};

const buildTranscriptRequestUpdate = async ({
  callRecording,
  externalBotId,
  externalRecordingIdFromEvent,
}: {
  callRecording: MatchedCallRecording;
  externalBotId: string | undefined;
  externalRecordingIdFromEvent: string | undefined;
}): Promise<CallRecordingUpdateFields> => {
  const externalRecordingId =
    externalRecordingIdFromEvent ??
    callRecording.externalRecordingId ??
    (isUndefined(externalBotId)
      ? undefined
      : await fetchExternalRecordingIdFromRecallBot(externalBotId));

  if (isUndefined(externalRecordingId)) {
    console.warn(
      `[recall-recording-bot] cannot request transcript for call recording ${callRecording.id}: no Recall recording id available`,
    );

    return {};
  }

  const transcriptMarker = await requestRecallTranscript({
    externalRecordingId,
    requestedAt: new Date().toISOString(),
  });

  if (isNull(transcriptMarker)) {
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

  if (isUndefined(callRecording)) {
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

  if (isUndefined(transcriptId)) {
    return {
      status: 'skipped',
      event,
      reason: 'missing transcript id',
    };
  }

  const downloadResult = await downloadRecallTranscript({ transcriptId });

  switch (downloadResult.outcome) {
    case 'filled': {
      const updateData: CallRecordingUpdateFields = {
        transcript: downloadResult.content as Record<string, unknown>,
        ...(isUndefined(callRecording.externalRecordingId)
          ? buildExternalRecordingIdUpdate(body)
          : {}),
      };
      const completesIngestion = shouldCompleteCallRecordingIngestion({
        current: callRecording,
        updateData,
      });

      if (completesIngestion) {
        updateData.status = CallRecordingStatus.COMPLETED;
      }

      await updateCallRecording(client, {
        id: callRecording.id,
        data: updateData,
      });

      if (completesIngestion) {
        await chargeCompletedCallRecording({
          callRecordingId: callRecording.id,
          startedAt: callRecording.startedAt,
          endedAt: callRecording.endedAt,
        });
      }

      return {
        status: 'updated',
        event,
        callRecordingId: callRecording.id,
        transcriptOutcome: 'FILLED',
      };
    }
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
      // 200-acked either way, Svix never redelivers; the cron re-check retries this.
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

  if (!isTranscriptUnset(callRecording) && isNull(existingMarker)) {
    return {
      status: 'skipped',
      event,
      reason: 'transcript already filled',
    };
  }

  console.warn(
    `[recall-recording-bot] transcript failed for call recording ${callRecording.id}${isNull(subCode) ? '' : ` (${subCode})`}`,
  );

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      transcript: buildFailedRecallTranscriptMarker({
        recallTranscriptId:
          transcriptId ?? existingMarker?.recallTranscriptId ?? null,
        subCode,
      }),
      // The transcript is part of the billed deliverable; its failure fails the recording.
      ...(isCallRecordingStatusDowngrade({
        fromStatus: callRecording.status,
        toStatus: CallRecordingStatus.FAILED_UNKNOWN,
      })
        ? {}
        : { status: CallRecordingStatus.FAILED_UNKNOWN }),
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
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
