import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_ARTIFACT_IMPORT_MAX_ATTEMPTS } from 'src/logic-functions/constants/call-recording-artifact-import-max-attempts';
import { CALL_RECORDING_ARTIFACT_IMPORT_REQUEUE_DELAY_MS } from 'src/logic-functions/constants/call-recording-artifact-import-requeue-delay-ms';
import {
  claimCallRecordingArtifactImport,
  releaseCallRecordingArtifactImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifact-import.util';
import { enqueueCallRecordingArtifactImport } from 'src/logic-functions/data/enqueue-call-recording-artifact-import.util';
import {
  findCallRecordingForArtifactImport,
  type CallRecordingForArtifactImport,
} from 'src/logic-functions/data/find-call-recording-for-artifact-import.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
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
      status: 'requeued';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      attempt: number;
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
    return requeueBouncedImport({
      callRecordingId: callRecording.id,
      scope,
      request,
    });
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

    if (!syncResult.updated) {
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

// Returning a result counts as a successful logic-function run, so the platform
// never redelivers it. A delivery that lost the lease race carries a signal
// nothing else will replay, so it re-enqueues itself rather than being dropped.
const requeueBouncedImport = async ({
  callRecordingId,
  scope,
  request,
}: {
  callRecordingId: string;
  scope: CallRecordingArtifactImportScope;
  request: CallRecordingArtifactsImportRequest;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const nextAttempt = request.attempt + 1;

  if (nextAttempt > CALL_RECORDING_ARTIFACT_IMPORT_MAX_ATTEMPTS) {
    console.warn(
      `[call-recorder] ${scope} import for call recording ${callRecordingId} was blocked by a held lease on all ${request.attempt} attempts; leaving it to the reconcile sweep`,
    );

    return {
      status: 'skipped',
      callRecordingId,
      scope,
      reason: 'artifact import already in progress',
    };
  }

  await enqueueCallRecordingArtifactImport({
    callRecordingId,
    scope,
    requestedAt: request.requestedAt,
    attempt: nextAttempt,
    delayMs: CALL_RECORDING_ARTIFACT_IMPORT_REQUEUE_DELAY_MS,
  });

  return {
    status: 'requeued',
    callRecordingId,
    scope,
    attempt: nextAttempt,
  };
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
