import { isNonEmptyString } from '@sniptt/guards';
import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomRequestMediaDownloadPayload } from 'src/logic-functions/types/fathom-media-download-payload.type';
import { applyFathomMediaDownload } from 'src/logic-functions/utils/apply-fathom-media-download.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { enqueueFathomMediaDownloadPoll } from 'src/logic-functions/utils/enqueue-fathom-media-download.util';
import { getFathomMediaFailureReasonForError } from 'src/logic-functions/utils/get-fathom-media-failure-reason-for-error.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { resolveFathomMediaImportTarget } from 'src/logic-functions/utils/resolve-fathom-media-import-target.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomRequestMediaDownloadHandler = async (
  payload: FathomRequestMediaDownloadPayload,
) => {
  if (
    !isNonEmptyString(payload.connectedAccountId) ||
    !isNonEmptyString(payload.callRecordingId) ||
    !Number.isSafeInteger(payload.recordingId)
  ) {
    throw new Error('Fathom media download request requires a valid payload');
  }

  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const target = await resolveFathomMediaImportTarget({
    coreApiClient,
    callRecordingId: payload.callRecordingId,
    recordingId: payload.recordingId,
  });

  if (target.status === 'skipped') {
    return { success: true, skipped: true, reason: target.reason };
  }

  const connection = await getConnection(payload.connectedAccountId);
  const fathomClient = createFathomClient(connection.accessToken);

  let download: RecordingDownload;

  try {
    download = await fathomClient.createRecordingDownload({
      recordingId: payload.recordingId,
    });
  } catch (error) {
    if (isTransientFathomError(error)) {
      throw new RetryableLogicFunctionError(toErrorMessage(error));
    }

    const failureReason = getFathomMediaFailureReasonForError(error);

    if (!isDefined(failureReason)) {
      throw error;
    }

    await recordFathomMediaFailure({
      coreApiClient,
      callRecordingId: payload.callRecordingId,
      reason: failureReason,
    });

    return { success: true, skipped: true, reason: failureReason };
  }

  // Audio-only recordings can come back completed on the first call, so the
  // import runs here instead of paying for a poll that has nothing to wait for.
  const applyResult = await applyFathomMediaDownload({
    coreApiClient,
    callRecordingId: payload.callRecordingId,
    download,
  });

  if (applyResult.outcome === 'pending') {
    await enqueueFathomMediaDownloadPoll({
      ...payload,
      downloadId: download.downloadId,
      attempt: 0,
    });

    return { success: true, downloadId: download.downloadId, pending: true };
  }

  if (applyResult.outcome === 'unavailable') {
    console.warn(
      `[fathom] media-import phase=download-unavailable callRecordingId=${payload.callRecordingId} recordingId=${payload.recordingId} reason=${applyResult.reason}`,
    );
  }

  return {
    success: true,
    downloadId: download.downloadId,
    outcome: applyResult.outcome,
  };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
  name: 'fathom-request-media-download',
  description:
    "Asks Fathom to generate the downloadable media for one recording, imports it when the download is ready immediately, and otherwise schedules a poll for Fathom's background generation.",
  timeoutSeconds: 300,
  handler: fathomRequestMediaDownloadHandler,
});
