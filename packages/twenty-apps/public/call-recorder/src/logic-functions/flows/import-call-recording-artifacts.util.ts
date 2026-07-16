import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingForArtifactsImport = SyncableCallRecording & {
  externalBotId: string | undefined;
};

type CallRecordingForArtifactsImportNode = {
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

export type ImportCallRecordingArtifactsResult =
  | {
      status: 'imported';
      callRecordingId: string;
      outcome: 'call-recording-artifacts-imported';
    }
  | {
      status: 'skipped';
      callRecordingId: string;
      reason: string;
    };

// Route callers can forge provider ids, so imports resolve only from the
// CallRecording's persisted Recall bot.
export const importCallRecordingArtifacts = async ({
  client,
  request,
}: {
  client: CoreApiClient;
  request: CallRecordingArtifactsImportRequest;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const callRecording = await findCallRecordingForArtifactsImport(
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

  // Svix redelivers a webhook to several workers at once; the lease ensures only
  // one performs the provider transcript request and media upload. The lease clock
  // is wall-clock, not request.requestedAt, so a retry of the same delivery still
  // measures real elapsed time and can reclaim a lease left behind by a crash.
  const claimedImport = await claimCallRecordingArtifactsImport(client, {
    callRecordingId: callRecording.id,
    now: new Date(),
  });

  if (!claimedImport) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      reason: 'artifact import already in progress',
    };
  }

  try {
    const bot = await fetchRecallBotWhenRecordingIdMissing(callRecording);
    const syncResult = await syncCallRecording({
      client,
      callRecording,
      bot,
      treatRecordingAsDone: true,
      requestedAt: request.requestedAt,
    });

    if (!syncResult.updated) {
      return {
        status: 'skipped',
        callRecordingId: callRecording.id,
        reason: 'no artifact updates',
      };
    }

    return {
      status: 'imported',
      callRecordingId: callRecording.id,
      outcome: 'call-recording-artifacts-imported',
    };
  } finally {
    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId: callRecording.id,
    });
  }
};

const fetchRecallBotWhenRecordingIdMissing = async (
  callRecording: CallRecordingForArtifactsImport,
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

const findCallRecordingForArtifactsImport = async (
  client: CoreApiClient,
  callRecordingId: string,
): Promise<CallRecordingForArtifactsImport | undefined> => {
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
    | CallRecordingForArtifactsImportNode
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
