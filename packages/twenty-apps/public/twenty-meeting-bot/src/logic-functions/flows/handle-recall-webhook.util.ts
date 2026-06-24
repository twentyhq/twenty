import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { buildTranscriptFailureReason } from 'src/logic-functions/domain/build-transcript-failure-reason.util';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { extractRecallBotConvergence } from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isRecallRecordingDoneSignal } from 'src/logic-functions/domain/is-recall-recording-done-signal.util';
import { mapRecallStatusCodeToCallRecordingStatus } from 'src/logic-functions/domain/map-recall-status-code-to-call-recording-status.util';
import {
  parseRecallWebhookEvent,
  type RecallWebhookBody,
  type RecallWebhookEvent,
} from 'src/logic-functions/recall-api/parse-recall-webhook-event.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { reconcileCallRecordingTranscriptArtifact } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util';
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

type ExternalRecordingIdResolution = {
  externalRecordingId: string | undefined;
  providerLookupFailed: boolean;
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
    ...(isUndefined(webhookEvent.externalBotId)
      ? {}
      : { externalBotId: webhookEvent.externalBotId }),
    ...buildExternalRecordingIdUpdate(webhookEvent),
    ...buildCallRecordingStatusUpdate({
      reason: getRecallWebhookFailureReason(webhookEvent),
      status: callRecordingStatus,
    }),
    ...buildRecordingTimestampsUpdate({ webhookEvent, callRecording }),
  };

  if (isRecallRecordingDoneSignal({ event, statusCode })) {
    const externalRecordingIdResolution = await resolveExternalRecordingId({
      callRecording,
      webhookEvent,
    });

    Object.assign(
      updateData,
      await buildTranscriptArtifactUpdate({
        callRecording,
        externalRecordingId: externalRecordingIdResolution.externalRecordingId,
      }),
    );

    Object.assign(
      updateData,
      await buildMediaIngestionUpdate({
        callRecording,
        externalRecordingId: externalRecordingIdResolution.externalRecordingId,
      }),
    );

    const terminalArtifactGateFailureUpdate =
      buildTerminalArtifactGateFailureUpdate({
        callRecording,
        providerLookupFailed:
          externalRecordingIdResolution.providerLookupFailed,
        updateData,
        webhookEvent,
      });

    if (!isUndefined(terminalArtifactGateFailureUpdate)) {
      Object.assign(updateData, terminalArtifactGateFailureUpdate);
    }
  }

  const { completesIngestion } = await persistCallRecordingProgress(client, {
    id: callRecording.id,
    current: callRecording,
    updateData,
  });

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    callRecordingStatus: completesIngestion
      ? CallRecordingStatus.COMPLETED
      : (updateData.status ?? callRecordingStatus),
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
    return CallRecordingStatus.FAILED;
  }

  return mapRecallStatusCodeToCallRecordingStatus(statusCode);
};

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

type NonFailedCallRecordingStatus = Exclude<
  CallRecordingStatus,
  CallRecordingStatus.FAILED
>;

type CallRecordingStatusUpdate =
  | {
      status: NonFailedCallRecordingStatus;
    }
  | {
      status: CallRecordingStatus.FAILED;
      meetingBotFailureReason: string;
    };

type TerminalArtifactGateFailureUpdate = {
  status: CallRecordingStatus.FAILED;
  meetingBotFailureReason: string;
};

const buildCallRecordingStatusUpdate = ({
  reason,
  status,
}: {
  reason: string;
  status: CallRecordingStatus;
}): CallRecordingStatusUpdate => {
  if (status === CallRecordingStatus.FAILED) {
    return { status, meetingBotFailureReason: reason };
  }

  return { status };
};

const buildTerminalArtifactGateFailureUpdate = ({
  callRecording,
  providerLookupFailed,
  updateData,
  webhookEvent,
}: {
  callRecording: MatchedCallRecording;
  providerLookupFailed: boolean;
  updateData: CallRecordingUpdateFields;
  webhookEvent: RecallWebhookEvent;
}): TerminalArtifactGateFailureUpdate | undefined => {
  if (updateData.status === CallRecordingStatus.FAILED) {
    return isUndefined(updateData.meetingBotFailureReason)
      ? {
          status: CallRecordingStatus.FAILED,
          meetingBotFailureReason: getRecallWebhookFailureReason(webhookEvent),
        }
      : undefined;
  }

  if (
    providerLookupFailed ||
    hasRecordingArtifactPath({ callRecording, updateData })
  ) {
    return undefined;
  }

  return {
    status: CallRecordingStatus.FAILED,
    meetingBotFailureReason: 'recording_artifacts_unavailable',
  };
};

const getRecallWebhookFailureReason = ({
  event,
  statusCode,
}: RecallWebhookEvent): string => statusCode ?? event;

const hasRecordingArtifactPath = ({
  callRecording,
  updateData,
}: {
  callRecording: MatchedCallRecording;
  updateData: CallRecordingUpdateFields;
}): boolean => {
  return (
    !isUndefined(
      updateData.externalRecordingId ?? callRecording.externalRecordingId,
    ) ||
    isNonEmptyArray(updateData.audio ?? callRecording.audio) ||
    isNonEmptyArray(updateData.video ?? callRecording.video) ||
    hasReachableTranscript(updateData.transcript ?? callRecording.transcript)
  );
};

const hasReachableTranscript = (transcript: unknown): boolean => {
  if (isNull(transcript) || isUndefined(transcript)) {
    return false;
  }

  const marker = parseTranscriptMarker(transcript);

  return isUndefined(marker) || marker.status === 'PENDING';
};

const isTranscriptUnset = (callRecording: MatchedCallRecording): boolean =>
  isUndefined(callRecording.transcript);

const buildMediaIngestionUpdate = async ({
  callRecording,
  externalRecordingId,
}: {
  callRecording: MatchedCallRecording;
  externalRecordingId: string | undefined;
}): Promise<Pick<CallRecordingUpdateFields, 'audio' | 'video'>> => {
  const hasAudio = isNonEmptyArray(callRecording.audio);
  const hasVideo = isNonEmptyArray(callRecording.video);

  if (hasAudio && hasVideo) {
    return {};
  }

  if (isUndefined(externalRecordingId)) {
    console.warn(
      `[twenty-meeting-bot] cannot ingest media for call recording ${callRecording.id}: no Recall recording id available`,
    );

    return {};
  }

  return ingestCallRecordingMedia({
    callRecordingId: callRecording.id,
    externalRecordingId,
    hasAudio,
    hasVideo,
  });
};

const buildTranscriptArtifactUpdate = async ({
  callRecording,
  externalRecordingId,
}: {
  callRecording: MatchedCallRecording;
  externalRecordingId: string | undefined;
}): Promise<CallRecordingUpdateFields> => {
  if (isUndefined(externalRecordingId)) {
    console.warn(
      `[twenty-meeting-bot] cannot reconcile transcript for call recording ${callRecording.id}: no Recall recording id available`,
    );

    return {};
  }

  const transcriptArtifactResult =
    await reconcileCallRecordingTranscriptArtifact({
      callRecordingId: callRecording.id,
      currentStatus: callRecording.status,
      externalRecordingId,
      requestedAt: new Date().toISOString(),
      transcript: callRecording.transcript,
    });

  return {
    ...(isUndefined(callRecording.externalRecordingId)
      ? { externalRecordingId }
      : {}),
    ...transcriptArtifactResult.updateData,
  };
};

const resolveExternalRecordingId = async ({
  callRecording,
  webhookEvent,
}: {
  callRecording: MatchedCallRecording;
  webhookEvent: RecallWebhookEvent;
}): Promise<ExternalRecordingIdResolution> => {
  const externalRecordingId =
    webhookEvent.externalRecordingId ?? callRecording.externalRecordingId;

  if (!isUndefined(externalRecordingId)) {
    return { externalRecordingId, providerLookupFailed: false };
  }

  if (isUndefined(webhookEvent.externalBotId)) {
    return { externalRecordingId: undefined, providerLookupFailed: false };
  }

  return fetchExternalRecordingIdFromRecallBot(webhookEvent.externalBotId);
};

const fetchExternalRecordingIdFromRecallBot = async (
  externalBotId: string,
): Promise<ExternalRecordingIdResolution> => {
  const botResult = await getRecallBot({ externalBotId });

  if (!botResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to fetch Recall bot ${externalBotId} while resolving a recording id: ${botResult.errorMessage}`,
    );

    return { externalRecordingId: undefined, providerLookupFailed: true };
  }

  return {
    externalRecordingId: extractRecallBotConvergence(botResult.bot)
      .externalRecordingId,
    providerLookupFailed: false,
  };
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
    return applyTranscriptFailure({
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

  const downloadResult = await downloadTranscript({ transcriptId });

  switch (downloadResult.outcome) {
    case 'filled': {
      const updateData: CallRecordingUpdateFields = {
        transcript: downloadResult.content as Record<string, unknown>,
        ...(isUndefined(callRecording.externalRecordingId)
          ? buildExternalRecordingIdUpdate(webhookEvent)
          : {}),
      };

      await persistCallRecordingProgress(client, {
        id: callRecording.id,
        current: callRecording,
        updateData,
      });

      return {
        status: 'updated',
        event,
        callRecordingId: callRecording.id,
        transcriptOutcome: 'FILLED',
      };
    }
    case 'failed':
      return applyTranscriptFailure({
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
        `[twenty-meeting-bot] could not fill transcript for call recording ${callRecording.id}: ${reason}`,
      );

      return {
        status: 'skipped',
        event,
        reason,
      };
    }
  }
};

const applyTranscriptFailure = async ({
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
  const existingMarker = parseTranscriptMarker(callRecording.transcript);

  if (!isTranscriptUnset(callRecording) && isUndefined(existingMarker)) {
    return {
      status: 'skipped',
      event,
      reason: 'transcript already filled',
    };
  }

  console.warn(
    `[twenty-meeting-bot] transcript failed for call recording ${callRecording.id}${isNull(subCode) ? '' : ` (${subCode})`}`,
  );

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      transcript: buildFailedTranscriptMarker({
        recallTranscriptId:
          transcriptId ?? existingMarker?.recallTranscriptId ?? null,
        subCode,
      }),
      meetingBotFailureReason: buildTranscriptFailureReason(subCode),
      ...(isCallRecordingStatusDowngrade({
        fromStatus: callRecording.status,
        toStatus: CallRecordingStatus.FAILED,
      })
        ? {}
        : { status: CallRecordingStatus.FAILED }),
    },
  });

  return {
    status: 'updated',
    event,
    callRecordingId: callRecording.id,
    transcriptOutcome: 'FAILED',
  };
};
