import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'src/utils/is-defined';

import { FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS } from 'src/constants/fathom.constant';
import { FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type FathomImportMediaDownloadPayload } from 'src/logic-functions/types/fathom-media-download-payload.type';
import { applyFathomMediaDownload } from 'src/logic-functions/utils/apply-fathom-media-download.util';
import { createFathomClient } from 'src/logic-functions/utils/create-fathom-client.util';
import { enqueueFathomMediaDownloadPoll } from 'src/logic-functions/utils/enqueue-fathom-media-download.util';
import { isFathomMediaUnavailableError } from 'src/logic-functions/utils/is-fathom-media-unavailable-error.util';
import { isTransientFathomError } from 'src/logic-functions/utils/is-transient-fathom-error.util';
import { resolveFathomMediaImportTarget } from 'src/logic-functions/utils/resolve-fathom-media-import-target.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const fathomImportMediaDownloadHandler = async (
  payload: FathomImportMediaDownloadPayload,
) => {
  if (
    !isNonEmptyString(payload.connectedAccountId) ||
    !isNonEmptyString(payload.callRecordingId) ||
    !isNonEmptyString(payload.downloadId) ||
    !Number.isSafeInteger(payload.recordingId) ||
    !Number.isSafeInteger(payload.attempt)
  ) {
    throw new Error('Fathom media download import requires a valid payload');
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
  const download = await fathomClient
    .getRecordingDownload({
      recordingId: payload.recordingId,
      downloadId: payload.downloadId,
    })
    .catch((error: unknown) => {
      if (isTransientFathomError(error)) {
        throw new RetryableLogicFunctionError(toErrorMessage(error));
      }

      if (isFathomMediaUnavailableError(error)) {
        return undefined;
      }

      throw error;
    });

  if (!isDefined(download)) {
    return {
      success: true,
      skipped: true,
      reason: 'Fathom no longer offers this download',
    };
  }

  const applyResult = await applyFathomMediaDownload({
    coreApiClient,
    callRecordingId: payload.callRecordingId,
    download,
  });

  if (applyResult.outcome === 'pending') {
    const nextAttempt = payload.attempt + 1;

    if (nextAttempt >= FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS) {
      console.warn(
        `[fathom] media-import phase=poll-budget-exhausted callRecordingId=${payload.callRecordingId} recordingId=${payload.recordingId} downloadId=${payload.downloadId} attempts=${nextAttempt}`,
      );

      return { success: true, pending: true, exhausted: true };
    }

    await enqueueFathomMediaDownloadPoll({ ...payload, attempt: nextAttempt });

    return { success: true, pending: true, attempt: nextAttempt };
  }

  if (applyResult.outcome === 'unavailable') {
    console.warn(
      `[fathom] media-import phase=download-unavailable callRecordingId=${payload.callRecordingId} recordingId=${payload.recordingId} reason=${applyResult.reason}`,
    );
  }

  return { success: true, outcome: applyResult.outcome };
};

export default defineLogicFunction({
  universalIdentifier: FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
  name: 'fathom-import-media-download',
  description:
    "Polls one Fathom recording download and streams the generated video or audio into the CallRecording's media fields once Fathom finishes generating it.",
  timeoutSeconds: 900,
  handler: fathomImportMediaDownloadHandler,
});
