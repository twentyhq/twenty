import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_API_NOT_FOUND_STATUS } from 'src/logic-functions/constants/recall-api-not-found-status';
import {
  findCallRecordingForArtifactsImport,
  type CallRecordingForArtifactsImport,
} from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { updateClaimedCallRecordingArtifacts } from 'src/logic-functions/data/update-claimed-call-recording-artifacts.util';
import { buildCallRecordingSyncUpdate } from 'src/logic-functions/domain/build-call-recording-sync-update.util';
import { buildExpiredMediaImportUpdate } from 'src/logic-functions/domain/build-expired-media-import-update.util';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { importCallRecordingMedia } from 'src/logic-functions/flows/import-call-recording-media.util';
import { importCallRecordingTranscript } from 'src/logic-functions/flows/import-call-recording-transcript.util';
import { runCallRecordingArtifactImportWithClaim } from 'src/logic-functions/flows/run-call-recording-artifact-import-with-claim.util';
import { settleCallRecordingImport } from 'src/logic-functions/flows/settle-call-recording-import.util';
import { extractRecallBotSyncState } from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';
import { type CallRecordingArtifactsImportRequest } from 'src/logic-functions/types/call-recording-artifacts-import-request.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

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

type RecallBotSyncResult = {
  externalRecordingId: string | undefined;
  isMediaExpired: boolean;
  updateData: CallRecordingUpdateFields;
};

type ScopeArtifactsImportResult = {
  updateData: CallRecordingUpdateFields;
  hasRetryableFailure: boolean;
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

  if (initialCallRecording.status !== CallRecordingStatus.PROCESSING) {
    return {
      status: 'skipped',
      callRecordingId: request.callRecordingId,
      scope,
      reason: 'call recording is not processing',
    };
  }

  const now = new Date();
  const saveUnderClaim = (data: CallRecordingUpdateFields) =>
    updateClaimedCallRecordingArtifacts(client, {
      callRecordingId: initialCallRecording.id,
      scope,
      claimedAt: now.toISOString(),
      data,
    });
  const artifactImportExecution = await runCallRecordingArtifactImportWithClaim(
    {
      client,
      callRecordingId: initialCallRecording.id,
      scope,
      now,
      runImport: async (callRecording) => {
        const botSync = await syncRecallBotState(callRecording);

        if (
          !isUndefined(botSync.updateData.status) &&
          botSync.updateData.status !== CallRecordingStatus.PROCESSING
        ) {
          await saveUnderClaim(botSync.updateData);

          return {
            status: 'skipped',
            callRecordingId: callRecording.id,
            scope,
            reason: 'call recording is not processing',
          } satisfies ImportCallRecordingArtifactsResult;
        }

        const scopeArtifactsImport = await importScopeArtifacts({
          callRecording,
          scope,
          requestedAt: request.requestedAt,
          externalRecordingId: botSync.externalRecordingId,
          isMediaExpired: botSync.isMediaExpired,
        });

        const updateData = {
          ...botSync.updateData,
          ...scopeArtifactsImport.updateData,
        };

        // Artifacts that landed are kept even when a sibling must be retried.
        await saveUnderClaim(updateData);

        if (scopeArtifactsImport.hasRetryableFailure) {
          throw new Error(
            `Recall ${scope} artifacts for call recording ${callRecording.id} could not be imported`,
          );
        }

        const settlementOutcome = await settleCallRecordingImport(client, {
          callRecordingId: callRecording.id,
        });

        if (
          !hasCallRecordingUpdateFields(updateData) &&
          settlementOutcome === 'pending'
        ) {
          return {
            status: 'skipped',
            callRecordingId: callRecording.id,
            scope,
            reason: 'no artifact updates',
          } satisfies ImportCallRecordingArtifactsResult;
        }

        return {
          status: 'imported',
          callRecordingId: callRecording.id,
          scope,
          outcome: 'call-recording-artifacts-imported',
        } satisfies ImportCallRecordingArtifactsResult;
      },
    },
  );

  if (artifactImportExecution.status === 'skipped') {
    return {
      status: 'skipped',
      callRecordingId: initialCallRecording.id,
      scope,
      reason: artifactImportExecution.reason,
    };
  }

  return artifactImportExecution.result;
};

// One GET /bot fills whatever the webhooks did not deliver; a vanished bot means its media is gone too.
const syncRecallBotState = async (
  callRecording: CallRecordingForArtifactsImport,
): Promise<RecallBotSyncResult> => {
  const hasCompleteBotState =
    !isUndefined(callRecording.externalRecordingId) &&
    !isUndefined(callRecording.startedAt) &&
    !isUndefined(callRecording.endedAt);

  if (hasCompleteBotState || isUndefined(callRecording.externalBotId)) {
    return {
      externalRecordingId: callRecording.externalRecordingId,
      isMediaExpired: false,
      updateData: {},
    };
  }

  const botResult = await getRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!botResult.ok) {
    if (botResult.status !== RECALL_API_NOT_FOUND_STATUS) {
      throw new Error(botResult.errorMessage);
    }

    return {
      externalRecordingId: callRecording.externalRecordingId,
      isMediaExpired: true,
      updateData: {},
    };
  }

  const syncState = extractRecallBotSyncState(botResult.bot);

  return {
    externalRecordingId:
      callRecording.externalRecordingId ?? syncState.externalRecordingId,
    isMediaExpired: !isUndefined(syncState.mediaExpiredAt),
    updateData: buildCallRecordingSyncUpdate({ callRecording, syncState }),
  };
};

const importScopeArtifacts = async ({
  callRecording,
  scope,
  requestedAt,
  externalRecordingId,
  isMediaExpired,
}: {
  callRecording: CallRecordingForArtifactsImport;
  scope: CallRecordingArtifactImportScope;
  requestedAt: string;
  externalRecordingId: string | undefined;
  isMediaExpired: boolean;
}): Promise<ScopeArtifactsImportResult> => {
  if (scope === 'transcript') {
    return importCallRecordingTranscript({
      callRecordingId: callRecording.id,
      currentStatus: callRecording.status,
      externalRecordingId,
      requestedAt,
      transcript: callRecording.transcript,
      isMediaExpired,
    });
  }

  if (isMediaExpired) {
    return {
      updateData: buildExpiredMediaImportUpdate(callRecording),
      hasRetryableFailure: false,
    };
  }

  if (isUndefined(externalRecordingId)) {
    return { updateData: {}, hasRetryableFailure: false };
  }

  const mediaImport = await importCallRecordingMedia({
    callRecordingId: callRecording.id,
    externalRecordingId,
    hasAudio: isNonEmptyArray(callRecording.audio),
    hasVideo: isNonEmptyArray(callRecording.video),
  });

  return {
    updateData: {
      ...mediaImport.updateData,
      ...(mediaImport.isRecordingGone === true
        ? buildExpiredMediaImportUpdate(callRecording)
        : {}),
    },
    hasRetryableFailure: mediaImport.hasRetryableFailure,
  };
};
