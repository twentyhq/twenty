import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { buildFailedRecallTranscriptMarker } from 'src/logic-functions/domain/build-failed-recall-transcript-marker.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';
import { downloadRecallTranscript } from 'src/logic-functions/flows/download-recall-transcript.util';
import { extractRecallBotConvergence } from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { ingestRecallMedia } from 'src/logic-functions/flows/ingest-recall-media.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/domain/is-recall-recording-done-signal.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/map-recall-status-code-to-call-recording-status.util';
import {
  parseRecallWebhookEvent,
  type RecallWebhookBody,
  type RecallWebhookEvent,
} from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { parseRecallTranscriptMarker } from 'src/logic-functions/domain/parse-recall-transcript-marker.util';
import { requestRecallTranscript } from 'src/logic-functions/flows/request-recall-transcript.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/data/update-call-recording.util';

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
  const webhookEvent = parseRecallWebhookEvent(body);

  if (isUndefined(webhookEvent)) {
    return {
      status: 'skipped',
      event: null,
      reason: 'missing event type',
    };
  }

  const { event } = webhookEvent;

  // Transcript events carry no status code and would trip the downgrade guard.
  if (event === 'transcript.done' || event === 'transcript.failed') {
    return handleRecallTranscriptEvent({ client, webhookEvent, event });
  }

  return handleRecallStatusEvent({ client, webhookEvent });
};

const handleRecallStatusEvent = async ({
  client,
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<RecallWebhookHandlerResult> => {
  const { event, statusCode } = webhookEvent;
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

  const callRecording = await findMatchingCallRecording({
    client,
    webhookEvent,
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
    ...(isUndefined(webhookEvent.externalBotId)
      ? {}
      : { externalBotId: webhookEvent.externalBotId }),
    ...buildExternalRecordingIdUpdate(webhookEvent),
    ...buildRecordingTimestampsUpdate({ webhookEvent, callRecording }),
  };

  if (isRecallRecordingDoneSignal({ event, statusCode })) {
    if (isTranscriptUnset(callRecording)) {
      const transcriptRequestUpdate = await buildTranscriptRequestUpdate({
        callRecording,
        webhookEvent,
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
      await buildMediaIngestionUpdate({ callRecording, webhookEvent }),
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
  webhookEvent,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
}): Promise<MatchedCallRecording | undefined> => {
  if (!isUndefined(webhookEvent.callRecordingIdFromMetadata)) {
    return findCallRecordingByFilter(client, {
      id: { eq: webhookEvent.callRecordingIdFromMetadata },
    });
  }

  if (isUndefined(webhookEvent.externalBotId)) {
    return undefined;
  }

  return findCallRecordingByFilter(client, {
    externalBotId: { eq: webhookEvent.externalBotId },
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
  webhookEvent,
  callRecording,
}: {
  webhookEvent: RecallWebhookEvent;
  callRecording: MatchedCallRecording;
}): { startedAt?: string; endedAt?: string } => {
  const { event, statusCode, statusTimestamp } = webhookEvent;

  const impliesRecordingStarted = statusCode === 'in_call_recording';
  const impliesRecordingEnded =
    event === 'recording.done' ||
    statusCode === 'call_ended' ||
    statusCode === 'done';

  const startedAt =
    webhookEvent.recordingStartedAt ??
    (impliesRecordingStarted ? statusTimestamp : undefined);
  const endedAt =
    webhookEvent.recordingEndedAt ??
    (impliesRecordingEnded ? statusTimestamp : undefined);

  return {
    ...(!isUndefined(startedAt) && isUndefined(callRecording.startedAt)
      ? { startedAt }
      : {}),
    ...(!isUndefined(endedAt) && isUndefined(callRecording.endedAt)
      ? { endedAt }
      : {}),
  };
};

const buildExternalRecordingIdUpdate = (
  webhookEvent: RecallWebhookEvent,
): { externalRecordingId?: string } =>
  isUndefined(webhookEvent.externalRecordingId)
    ? {}
    : { externalRecordingId: webhookEvent.externalRecordingId };

const isTranscriptUnset = (callRecording: MatchedCallRecording): boolean =>
  isUndefined(callRecording.transcript);

const buildMediaIngestionUpdate = async ({
  callRecording,
  webhookEvent,
}: {
  callRecording: MatchedCallRecording;
  webhookEvent: RecallWebhookEvent;
}): Promise<Pick<CallRecordingUpdateFields, 'audio' | 'video'>> => {
  const hasAudio = isNonEmptyArray(callRecording.audio);
  const hasVideo = isNonEmptyArray(callRecording.video);

  if (hasAudio && hasVideo) {
    return {};
  }

  const externalRecordingId = await resolveExternalRecordingId({
    callRecording,
    webhookEvent,
  });

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
  webhookEvent,
}: {
  callRecording: MatchedCallRecording;
  webhookEvent: RecallWebhookEvent;
}): Promise<CallRecordingUpdateFields> => {
  const externalRecordingId = await resolveExternalRecordingId({
    callRecording,
    webhookEvent,
  });

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

// Event, then row, then a GET /bot as last resort.
const resolveExternalRecordingId = async ({
  callRecording,
  webhookEvent,
}: {
  callRecording: MatchedCallRecording;
  webhookEvent: RecallWebhookEvent;
}): Promise<string | undefined> =>
  webhookEvent.externalRecordingId ??
  callRecording.externalRecordingId ??
  (isUndefined(webhookEvent.externalBotId)
    ? undefined
    : await fetchExternalRecordingIdFromRecallBot(webhookEvent.externalBotId));

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
  webhookEvent,
  event,
}: {
  client: CoreApiClient;
  webhookEvent: RecallWebhookEvent;
  event: 'transcript.done' | 'transcript.failed';
}): Promise<RecallWebhookHandlerResult> => {
  const callRecording = await findMatchingCallRecording({
    client,
    webhookEvent,
  });

  if (isUndefined(callRecording)) {
    return {
      status: 'skipped',
      event,
      reason: 'no matching call recording',
    };
  }

  const { transcriptId } = webhookEvent;

  if (event === 'transcript.failed') {
    return applyRecallTranscriptFailure({
      client,
      callRecording,
      event,
      transcriptId,
      subCode: webhookEvent.transcriptFailureSubCode ?? null,
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
          ? buildExternalRecordingIdUpdate(webhookEvent)
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

  if (!isTranscriptUnset(callRecording) && isUndefined(existingMarker)) {
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
