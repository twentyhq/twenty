import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import {
  reconcileCallRecording,
  type ReconcilableCallRecording,
} from 'src/logic-functions/flows/reconcile-call-recording.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type RecallWebhookArtifactContinuationRequest } from 'src/logic-functions/types/recall-webhook-artifact-continuation-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingForArtifactProcessing = ReconcilableCallRecording & {
  externalBotId: string | undefined;
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
      callRecordingId: string;
      outcome: 'recording-artifacts-reconciled';
    }
  | {
      status: 'skipped';
      callRecordingId: string;
      reason: string;
    };

// Route callers can forge payload provider ids, so reconciliation resolves only
// from the recording's own persisted bot.
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
      callRecordingId: request.callRecordingId,
      reason: 'no matching call recording',
    };
  }

  const bot = await fetchRecallBotWhenRecordingIdMissing(callRecording);
  const reconcileResult = await reconcileCallRecording({
    client,
    callRecording,
    bot,
    treatRecordingAsDone: true,
    requestedAt: request.requestedAt,
  });

  if (!reconcileResult.updated) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      reason: 'no artifact updates',
    };
  }

  return {
    status: 'processed',
    callRecordingId: callRecording.id,
    outcome: 'recording-artifacts-reconciled',
  };
};

const fetchRecallBotWhenRecordingIdMissing = async (
  callRecording: CallRecordingForArtifactProcessing,
): Promise<RecallBotSnapshot | undefined> => {
  if (!isUndefined(callRecording.externalRecordingId)) {
    return undefined;
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

  return botResult.bot;
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
