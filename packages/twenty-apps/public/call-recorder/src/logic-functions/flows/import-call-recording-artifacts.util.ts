import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactImport,
  releaseCallRecordingArtifactImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifact-import.util';
import {
  findCallRecordingForArtifactImport,
  type CallRecordingForArtifactImport,
} from 'src/logic-functions/data/find-call-recording-for-artifact-import.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { settleCallRecordingImport } from 'src/logic-functions/flows/settle-call-recording-import.util';
import { syncCallRecording } from 'src/logic-functions/flows/sync-call-recording.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';

export type ImportCallRecordingArtifactsResult =
  | {
      status: 'imported';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      outcome: 'call-recording-artifacts-imported';
    }
  | {
      status: 'skipped';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      reason: string;
    };

// Job payloads can carry forged provider ids, so imports resolve only from the
// CallRecording's persisted Recall bot.
export const importCallRecordingArtifacts = async ({
  client,
  request,
  scope,
}: {
  client: CoreApiClient;
  request: CallRecordingArtifactsImportRequest;
  scope: CallRecordingArtifactImportScope;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const callRecording = await findCallRecordingForArtifactImport(
    client,
    request.callRecordingId,
  );

  if (isUndefined(callRecording)) {
    return {
      status: 'skipped',
      callRecordingId: request.callRecordingId,
      scope,
      reason: 'no matching call recording',
    };
  }

  // Svix redelivers a webhook to several workers at once; the lease ensures only
  // one performs the provider work for this scope. The lease clock is wall-clock,
  // not request.requestedAt, so a retry of the same delivery still measures real
  // elapsed time and can reclaim a lease left behind by a crash.
  const claimedImport = await claimCallRecordingArtifactImport(client, {
    callRecordingId: callRecording.id,
    scope,
    now: new Date(),
  });

  if (!claimedImport) {
    return {
      status: 'skipped',
      callRecordingId: callRecording.id,
      scope,
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
      artifactScope: scope,
    });

    // Each artifact swallows its own provider failure so a partial import still
    // persists. Raising it here is what makes the queue redeliver the job:
    // returning a result counts as success and nothing would revisit the
    // recording until the scheduled sweep.
    if (syncResult.hasRetryableArtifactFailure) {
      throw new Error(
        `Recall ${scope} artifacts for call recording ${callRecording.id} could not be imported`,
      );
    }

    const completedImport = await settleCallRecordingImport(client, {
      callRecordingId: callRecording.id,
    });

    if (!syncResult.updated && !completedImport) {
      return {
        status: 'skipped',
        callRecordingId: callRecording.id,
        scope,
        reason: 'no artifact updates',
      };
    }

    return {
      status: 'imported',
      callRecordingId: callRecording.id,
      scope,
      outcome: 'call-recording-artifacts-imported',
    };
  } finally {
    await releaseCallRecordingArtifactImportClaim(client, {
      callRecordingId: callRecording.id,
      scope,
    });
  }
};

const fetchRecallBotWhenRecordingIdMissing = async (
  callRecording: CallRecordingForArtifactImport,
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
