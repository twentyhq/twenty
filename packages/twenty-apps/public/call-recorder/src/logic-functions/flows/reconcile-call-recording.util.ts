import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_ARTIFACT_IMPORT_SCOPES } from 'src/logic-functions/constants/call-recording-artifact-import-scopes';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECALL_API_NOT_FOUND_STATUS } from 'src/logic-functions/constants/recall-api-not-found-status';
import { enqueueCallRecordingArtifactsImport } from 'src/logic-functions/data/enqueue-call-recording-artifacts-import.util';
import { findCallRecordingForArtifactsImport } from 'src/logic-functions/data/find-call-recording-for-artifacts-import.util';
import { buildCallRecordingSyncUpdate } from 'src/logic-functions/domain/build-call-recording-sync-update.util';
import { hasCallRecordingUpdateFields } from 'src/logic-functions/domain/has-call-recording-update-fields.util';
import { isReconcilableCallRecordingStatus } from 'src/logic-functions/domain/is-reconcilable-call-recording-status.util';
import { extractRecallBotSyncState } from 'src/logic-functions/recall-api/extract-recall-bot-sync-state.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const reconcileCallRecording = async ({
  client,
  callRecordingId,
}: {
  client: CoreApiClient;
  callRecordingId: string;
}): Promise<void> => {
  const callRecording = await findCallRecordingForArtifactsImport(
    client,
    callRecordingId,
  );

  if (
    isUndefined(callRecording) ||
    !isReconcilableCallRecordingStatus(callRecording.status)
  ) {
    return;
  }

  const reconcilableStatus = callRecording.status;

  if (reconcilableStatus === CallRecordingStatus.PROCESSING) {
    await enqueueCallRecordingArtifactsImport({
      callRecordingIds: [callRecordingId],
      scopes: CALL_RECORDING_ARTIFACT_IMPORT_SCOPES,
      trigger: 'recovery',
    });

    return;
  }

  if (isUndefined(callRecording.externalBotId)) {
    return;
  }

  const botResult = await getRecallBot({
    externalBotId: callRecording.externalBotId,
  });

  if (!botResult.ok && botResult.status !== RECALL_API_NOT_FOUND_STATUS) {
    throw new Error(botResult.errorMessage);
  }

  const data = botResult.ok
    ? buildCallRecordingSyncUpdate({
        callRecording,
        syncState: extractRecallBotSyncState(botResult.bot),
      })
    : buildLostRecallBotUpdate(reconcilableStatus);

  if (!hasCallRecordingUpdateFields(data)) {
    return;
  }

  const result = await client.mutation({
    updateCallRecordings: {
      __args: {
        filter: {
          id: { eq: callRecordingId },
          status: { eq: reconcilableStatus },
        },
        data,
      },
      id: true,
    },
  });

  if (
    (result.updateCallRecordings ?? []).length > 0 &&
    data.status === CallRecordingStatus.PROCESSING
  ) {
    await enqueueCallRecordingArtifactsImport({
      callRecordingIds: [callRecordingId],
      scopes: CALL_RECORDING_ARTIFACT_IMPORT_SCOPES,
      trigger: 'recovery',
    });
  }
};

// A completed recording keeps its artifacts even after Recall forgets the bot.
const buildLostRecallBotUpdate = (status: string): CallRecordingUpdateFields =>
  status === CallRecordingStatus.COMPLETED
    ? {}
    : {
        status: CallRecordingStatus.FAILED,
        callRecorderFailureReason: 'recall_bot_not_found',
      };
