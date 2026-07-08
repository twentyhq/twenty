import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { buildTranscriptFailureReason } from 'src/logic-functions/domain/build-transcript-failure-reason.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { reconcileCallRecordingTranscriptArtifact } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
import { extractRecallBotConvergence } from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type RecallWebhookArtifactContinuationRequest } from 'src/logic-functions/types/recall-webhook-artifact-continuation-request.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingForArtifactProcessing = {
  id: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  externalBotId?: string;
  externalRecordingId?: string;
  callRecorderFailureReason?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue;
  video?: FilesFieldValue;
};

type CallRecordingForArtifactProcessingNode = {
  id?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  callRecorderFailureReason?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
};

type ExternalRecordingIdResolution = {
  externalRecordingId: string | undefined;
  providerLookupFailed: boolean;
};

export type ProcessRecallWebhookArtifactsResult =
  | {
      status: 'processed';
      event: string;
      callRecordingId: string;
      outcome:
        | 'recording-artifacts-reconciled'
        | 'transcript-filled'
        | 'transcript-failed';
    }
  | {
      status: 'skipped';
      event: string;
      callRecordingId: string;
      reason: string;
    };

export const processRecallWebhookArtifacts = async ({
  client,
  request,
}: {
  client: CoreApiClient;
  request: RecallWebhookArtifactContinuationRequest;
}): Promise<ProcessRecallWebhookArtifactsResult> => {
  const callRecording = await findCallRecordingForArtifactProcessing(
    client,
    request.callRecordingId,
  );

  if (isUndefined(callRecording)) {
    return {
      status: 'skipped',
      event: request.event,
      callRecordingId: request.callRecordingId,
      reason: 'no matching call recording',
    };
  }

  if (request.event === 'transcript.done') {
    return processTranscriptDoneEvent({ client, callRecording, request });
  }

  if (request.event === 'transcript.failed') {
    return processTranscriptFailedEvent({ client, callRecording, request });
  }

  return processRecordingArtifactEvent({ client, callRecording, request });
};

const findCallRecordingForArtifactProcessing = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<CallRecordingForArtifactProcessing | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          externalBotId: true,
          externalRecordingId: true,
          callRecorderFailureReason: true,
          transcript: true,
          audio: { fileId: true },
          video: { fileId: true },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node as
    | CallRecordingForArtifactProcessingNode
    | null
    | undefined;
  const id = getString(node?.id);

  if (isUndefined(node) || isNull(node) || isUndefined(id)) {
    return undefined;
  }

  return {
    id,
    status: getString(node.status),
    startedAt: getString(node.startedAt),
    endedAt: getString(node.endedAt),
    externalBotId: getString(node.externalBotId),
    externalRecordingId: getString(node.externalRecordingId),
    callRecorderFailureReason: getString(node.callRecorderFailureReason),
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
  };
};

const processRecordingArtifactEvent = async ({
  client,
  callRecording,
  request,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingForArtifactProcessing;
  request: RecallWebhookArtifactContinuationRequest;
}): Promise<ProcessRecallWebhookArtifactsResult> => {
  const externalRecordingIdResolution = await resolveExternalRecordingId({
    callRecording,
    request,
  });
  const updateData: CallRecordingUpdateFields = {
    ...(isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(externalRecordingIdResolution.externalRecordingId)
      ? { externalRecordingId: externalRecordingIdResolution.externalRecordingId }
      : {}),
  };

  if (!isUndefined(externalRecordingIdResolution.externalRecordingId)) {
    const transcriptArtifactResult =
      await reconcileCallRecordingTranscriptArtifact({
        callRecordingId: callRecording.id,
        currentStatus: callRecording.status,
        externalRecordingId: externalRecordingIdResolution.externalRecordingId,
        requestedAt: request.requestedAt,
        transcript: callRecording.transcript,
      });

    Object.assign(updateData, transcriptArtifactResult.updateData);

    const mediaIngestionUpdate = await ingestCallRecordingMedia({
      callRecordingId: callRecording.id,
      externalRecordingId: externalRecordingIdResolution.externalRecordingId,
      hasAudio: isNonEmptyArray(callRecording.audio),
      hasVideo: isNonEmptyArray(callRecording.video),
    });

    if (
      callRecording.status === CallRecordingStatus.FAILED ||
      updateData.status === CallRecordingStatus.FAILED
    ) {
      delete mediaIngestionUpdate.callRecorderFailureReason;
    }

    Object.assign(updateData, mediaIngestionUpdate);
  }

  const terminalArtifactGateFailureUpdate =
    buildTerminalArtifactGateFailureUpdate({
      callRecording,
      providerLookupFailed: externalRecordingIdResolution.providerLookupFailed,
      updateData,
      externalRecordingId: externalRecordingIdResolution.externalRecordingId,
    });

  if (!isUndefined(terminalArtifactGateFailureUpdate)) {
    Object.assign(updateData, terminalArtifactGateFailureUpdate);
  }

  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current: callRecording,
    updateData,
  });

  if (Object.keys(updateData).length === 0 && !completesIngestion) {
    return {
      status: 'skipped',
      event: request.event,
      callRecordingId: callRecording.id,
      reason: 'no artifact updates',
    };
  }

  await persistCallRecordingProgress(client, {
    id: callRecording.id,
    current: callRecording,
    updateData,
  });

  return {
    status: 'processed',
    event: request.event,
    callRecordingId: callRecording.id,
    outcome: 'recording-artifacts-reconciled',
  };
};

const resolveExternalRecordingId = async ({
  callRecording,
  request,
}: {
  callRecording: CallRecordingForArtifactProcessing;
  request: RecallWebhookArtifactContinuationRequest;
}): Promise<ExternalRecordingIdResolution> => {
  const externalRecordingId =
    request.externalRecordingId ?? callRecording.externalRecordingId;

  if (!isUndefined(externalRecordingId)) {
    return { externalRecordingId, providerLookupFailed: false };
  }

  const externalBotId = request.externalBotId ?? callRecording.externalBotId;

  if (isUndefined(externalBotId)) {
    return { externalRecordingId: undefined, providerLookupFailed: false };
  }

  const botResult = await getRecallBot({ externalBotId });

  if (!botResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall bot ${externalBotId} while resolving a recording id: ${botResult.errorMessage}`,
    );

    return { externalRecordingId: undefined, providerLookupFailed: true };
  }

  return {
    externalRecordingId: extractRecallBotConvergence(botResult.bot)
      .externalRecordingId,
    providerLookupFailed: false,
  };
};

type TerminalArtifactGateFailureUpdate = {
  status: CallRecordingStatus.FAILED;
  callRecorderFailureReason: string;
};

const buildTerminalArtifactGateFailureUpdate = ({
  callRecording,
  providerLookupFailed,
  updateData,
  externalRecordingId,
}: {
  callRecording: CallRecordingForArtifactProcessing;
  providerLookupFailed: boolean;
  updateData: CallRecordingUpdateFields;
  externalRecordingId: string | undefined;
}): TerminalArtifactGateFailureUpdate | undefined => {
  if (
    callRecording.status === CallRecordingStatus.COMPLETED ||
    callRecording.status === CallRecordingStatus.FAILED ||
    updateData.status === CallRecordingStatus.FAILED ||
    providerLookupFailed ||
    !isUndefined(externalRecordingId) ||
    hasRecordingArtifactPath({ callRecording, updateData })
  ) {
    return undefined;
  }

  return {
    status: CallRecordingStatus.FAILED,
    callRecorderFailureReason: 'recording_artifacts_unavailable',
  };
};

const hasRecordingArtifactPath = ({
  callRecording,
  updateData,
}: {
  callRecording: CallRecordingForArtifactProcessing;
  updateData: CallRecordingUpdateFields;
}): boolean =>
  isNonEmptyArray(updateData.audio ?? callRecording.audio) ||
  isNonEmptyArray(updateData.video ?? callRecording.video) ||
  hasReachableTranscript(updateData.transcript ?? callRecording.transcript);

const hasReachableTranscript = (transcript: unknown): boolean => {
  if (isNull(transcript) || isUndefined(transcript)) {
    return false;
  }

  const marker = parseTranscriptMarker(transcript);

  return isUndefined(marker) || marker.status === 'PENDING';
};

const processTranscriptDoneEvent = async ({
  client,
  callRecording,
  request,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingForArtifactProcessing;
  request: RecallWebhookArtifactContinuationRequest;
}): Promise<ProcessRecallWebhookArtifactsResult> => {
  if (isUndefined(request.transcriptId)) {
    return {
      status: 'skipped',
      event: request.event,
      callRecordingId: callRecording.id,
      reason: 'missing transcript id',
    };
  }

  const downloadResult = await downloadTranscript({
    transcriptId: request.transcriptId,
  });

  if (downloadResult.outcome === 'filled') {
    await persistCallRecordingProgress(client, {
      id: callRecording.id,
      current: callRecording,
      updateData: {
        transcript: downloadResult.content as Record<string, unknown>,
        ...(isUndefined(callRecording.externalRecordingId) &&
        !isUndefined(request.externalRecordingId)
          ? { externalRecordingId: request.externalRecordingId }
          : {}),
      },
    });

    return {
      status: 'processed',
      event: request.event,
      callRecordingId: callRecording.id,
      outcome: 'transcript-filled',
    };
  }

  if (downloadResult.outcome === 'failed') {
    return applyTranscriptFailure({
      client,
      callRecording,
      request,
      transcriptId: request.transcriptId,
      subCode: downloadResult.subCode,
    });
  }

  const reason =
    downloadResult.outcome === 'pending'
      ? 'transcript not downloadable yet'
      : downloadResult.errorMessage;

  console.warn(
    `[call-recorder] could not fill transcript for call recording ${callRecording.id}: ${reason}`,
  );

  return {
    status: 'skipped',
    event: request.event,
    callRecordingId: callRecording.id,
    reason,
  };
};

const processTranscriptFailedEvent = async ({
  client,
  callRecording,
  request,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingForArtifactProcessing;
  request: RecallWebhookArtifactContinuationRequest;
}): Promise<ProcessRecallWebhookArtifactsResult> =>
  applyTranscriptFailure({
    client,
    callRecording,
    request,
    transcriptId: request.transcriptId,
    subCode: request.transcriptFailureSubCode ?? null,
  });

const applyTranscriptFailure = async ({
  client,
  callRecording,
  request,
  transcriptId,
  subCode,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingForArtifactProcessing;
  request: RecallWebhookArtifactContinuationRequest;
  transcriptId: string | undefined;
  subCode: string | null;
}): Promise<ProcessRecallWebhookArtifactsResult> => {
  const existingMarker = parseTranscriptMarker(callRecording.transcript);

  if (!isTranscriptUnset(callRecording) && isUndefined(existingMarker)) {
    return {
      status: 'skipped',
      event: request.event,
      callRecordingId: callRecording.id,
      reason: 'transcript already filled',
    };
  }

  if (isUndefined(transcriptId)) {
    return {
      status: 'skipped',
      event: request.event,
      callRecordingId: callRecording.id,
      reason: 'missing transcript id',
    };
  }

  await persistCallRecordingProgress(client, {
    id: callRecording.id,
    current: callRecording,
    updateData: buildTranscriptFailureUpdate({
      currentStatus: callRecording.status,
      transcriptId,
      subCode,
    }),
  });

  console.warn(
    `[call-recorder] Recall transcript ${transcriptId} failed for call recording ${callRecording.id}: ${subCode ?? 'unknown'}`,
  );

  return {
    status: 'processed',
    event: request.event,
    callRecordingId: callRecording.id,
    outcome: 'transcript-failed',
  };
};

const isTranscriptUnset = (
  callRecording: CallRecordingForArtifactProcessing,
): boolean => isUndefined(callRecording.transcript);

const buildTranscriptFailureUpdate = ({
  currentStatus,
  transcriptId,
  subCode,
}: {
  currentStatus: string | undefined;
  transcriptId: string;
  subCode: string | null;
}): CallRecordingUpdateFields => ({
  transcript: buildFailedTranscriptMarker({
    recallTranscriptId: transcriptId,
    subCode,
  }),
  callRecorderFailureReason: buildTranscriptFailureReason(subCode),
  ...(isCallRecordingStatusDowngrade({
    fromStatus: currentStatus,
    toStatus: CallRecordingStatus.FAILED,
  })
    ? {}
    : { status: CallRecordingStatus.FAILED }),
});
