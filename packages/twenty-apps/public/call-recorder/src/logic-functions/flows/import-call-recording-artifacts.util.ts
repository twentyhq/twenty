import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';
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
  const initialCallRecording = await findCallRecordingForArtifactsImport(
    client,
    request.callRecordingId,
  );

  if (isUndefined(initialCallRecording)) {
    return {
      status: 'skipped',
      callRecordingId: request.callRecordingId,
      scope,
      reason: 'no matching call recording',
    };
  }

  const hasClaimedArtifactImport = await claimCallRecordingArtifactsImport(
    client,
    {
      callRecordingId: initialCallRecording.id,
      scope,
      now: new Date(),
    },
  );

  if (!hasClaimedArtifactImport) {
    return {
      status: 'skipped',
      callRecordingId: initialCallRecording.id,
      scope,
      reason: 'artifact import already in progress',
    };
  }

  try {
    const callRecording = await findCallRecordingForArtifactsImport(
      client,
      initialCallRecording.id,
    );

    if (isUndefined(callRecording)) {
      return {
        status: 'skipped',
        callRecordingId: initialCallRecording.id,
        scope,
        reason: 'no matching call recording',
      };
    }

    const recallBot = await fetchRecallBotWhenRecordingIdMissing(callRecording);
    const callRecordingSyncResult = await syncCallRecording({
      client,
      callRecording,
      bot: recallBot,
      treatRecordingAsDone: true,
      requestedAt: request.requestedAt,
      artifactScope: scope,
    });

    if (callRecordingSyncResult.hasRetryableArtifactFailure) {
      throw new Error(
        `Recall ${scope} artifacts for call recording ${callRecording.id} could not be imported`,
      );
    }

    const hasCompletedImport = await settleCallRecordingImport(client, {
      callRecordingId: callRecording.id,
    });

    if (!callRecordingSyncResult.updated && !hasCompletedImport) {
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
      callRecordingId: initialCallRecording.id,
      scope,
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
