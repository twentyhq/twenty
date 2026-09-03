import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_ARTIFACTS_IMPORT_CLAIM_TTL_MS } from 'src/logic-functions/constants/call-recording-artifacts-import-claim-ttl-ms';
import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';
import {
  findCallRecordingForArtifactsImport,
  type CallRecordingForArtifactsImport,
} from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
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
      status: 'requeued';
      callRecordingId: string;
      scope: CallRecordingArtifactImportScope;
      leaseRetryCount: number;
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
  const callRecording = await findCallRecordingForArtifactsImport(
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
  const claimedImport = await claimCallRecordingArtifactsImport(client, {
    callRecordingId: callRecording.id,
    scope,
    now: new Date(),
  });

  if (!claimedImport) {
    return requeueCallRecordingArtifactsImport({
      callRecordingId: callRecording.id,
      request,
      scope,
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

    const completedImport = await settleCallRecordingImport(client, {
      callRecordingId: callRecording.id,
    });

    // A returned result counts as a successful run, so only a throw redelivers.
    if (syncResult.hasRetryableArtifactFailure) {
      throw new Error(
        `Recall ${scope} artifacts for call recording ${callRecording.id} could not be imported`,
      );
    }

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
    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId: callRecording.id,
      scope,
    });
  }
};

const ARTIFACTS_IMPORT_REQUEUE_DELAY_MS = 60 * 1000;
const ARTIFACTS_IMPORT_MAX_LEASE_RETRY_COUNT =
  Math.ceil(
    CALL_RECORDING_ARTIFACTS_IMPORT_CLAIM_TTL_MS /
      ARTIFACTS_IMPORT_REQUEUE_DELAY_MS,
  ) + 1;

const requeueCallRecordingArtifactsImport = async ({
  callRecordingId,
  request,
  scope,
}: {
  callRecordingId: string;
  request: CallRecordingArtifactsImportRequest;
  scope: CallRecordingArtifactImportScope;
}): Promise<ImportCallRecordingArtifactsResult> => {
  const nextLeaseRetryCount = request.leaseRetryCount + 1;

  if (nextLeaseRetryCount > ARTIFACTS_IMPORT_MAX_LEASE_RETRY_COUNT) {
    console.warn(
      `[call-recorder] ${scope} import for call recording ${callRecordingId} remained blocked through the lease retry window; leaving it to the reconcile sweep`,
    );

    return {
      status: 'skipped',
      callRecordingId,
      scope,
      reason: 'artifact import already in progress',
    };
  }

  await enqueueCallRecordingArtifactsImport({
    callRecordingId,
    scope,
    requestedAt: request.requestedAt,
    leaseRetryCount: nextLeaseRetryCount,
    delayMs: ARTIFACTS_IMPORT_REQUEUE_DELAY_MS,
  });

  return {
    status: 'requeued',
    callRecordingId,
    scope,
    leaseRetryCount: nextLeaseRetryCount,
  };
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
