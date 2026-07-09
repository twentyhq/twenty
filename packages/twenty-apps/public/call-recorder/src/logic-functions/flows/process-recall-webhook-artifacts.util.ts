import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
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

export type ProcessRecallWebhookArtifactsResult =
  | {
      status: 'processed';
      event: string;
      callRecordingId: string;
      outcome: 'recording-artifacts-reconciled';
    }
  | {
      status: 'skipped';
      event: string;
      callRecordingId: string;
      reason: string;
    };

// Route callers can forge payload provider ids, so artifacts resolve only from the recording's own persisted bot.
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

  const externalRecordingId = await resolveExternalRecordingId(callRecording);
  const updateData: CallRecordingUpdateFields = {
    ...(isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(externalRecordingId)
      ? { externalRecordingId }
      : {}),
  };

  if (!isUndefined(externalRecordingId)) {
    const transcriptArtifactResult =
      await reconcileCallRecordingTranscriptArtifact({
        callRecordingId: callRecording.id,
        currentStatus: callRecording.status,
        externalRecordingId,
        requestedAt: request.requestedAt,
        transcript: callRecording.transcript,
      });

    Object.assign(updateData, transcriptArtifactResult.updateData);

    const mediaIngestionUpdate = await ingestCallRecordingMedia({
      callRecordingId: callRecording.id,
      externalRecordingId,
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

const resolveExternalRecordingId = async (
  callRecording: CallRecordingForArtifactProcessing,
): Promise<string | undefined> => {
  if (!isUndefined(callRecording.externalRecordingId)) {
    return callRecording.externalRecordingId;
  }

  if (isUndefined(callRecording.externalBotId)) {
    return undefined;
  }

  const botResult = await getRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!botResult.ok) {
    console.warn(
      `[call-recorder] failed to fetch Recall bot ${callRecording.externalBotId} while resolving a recording id: ${botResult.errorMessage}`,
    );

    return undefined;
  }

  return extractRecallBotConvergence(botResult.bot).externalRecordingId;
};
