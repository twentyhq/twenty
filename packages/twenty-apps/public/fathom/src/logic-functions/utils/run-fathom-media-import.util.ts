import { Fathom } from 'fathom-typescript';
import { type RecordingDownload } from 'fathom-typescript/sdk/models/shared';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { getConnection } from 'twenty-sdk/logic-function';

import { FATHOM_MEDIA_FAILURE_REASON } from 'src/constants/fathom-media-failure-reason.constant';
import {
  FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS,
  FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS,
} from 'src/constants/fathom.constant';
import { fathomMediaImportPayloadSchema } from 'src/logic-functions/schemas/fathom-media-download-payload.schema';
import { applyFathomMediaDownload } from 'src/logic-functions/utils/apply-fathom-media-download.util';
import { buildRetryableFathomError } from 'src/logic-functions/utils/build-retryable-fathom-error.util';
import { claimFathomMediaImport } from 'src/logic-functions/utils/claim-fathom-media-import.util';
import { completeFathomCallRecordingImport } from 'src/logic-functions/utils/complete-fathom-call-recording-import.util';
import { enqueueFathomMediaDownloadPoll } from 'src/logic-functions/utils/enqueue-fathom-media-download-poll.util';
import { enqueueFathomMediaDownloadRequest } from 'src/logic-functions/utils/enqueue-fathom-media-download-request.util';
import { getFathomMediaFailureReasonForError } from 'src/logic-functions/utils/get-fathom-media-failure-reason-for-error.util';
import { getFathomRetryAfterDelay } from 'src/logic-functions/utils/get-fathom-retry-after-delay.util';
import { recordFathomMediaFailure } from 'src/logic-functions/utils/record-fathom-media-failure.util';
import { releaseFathomMediaImportClaim } from 'src/logic-functions/utils/release-fathom-media-import-claim.util';
import { resolveFathomMediaImportTarget } from 'src/logic-functions/utils/resolve-fathom-media-import-target.util';
import { updateFathomMediaDownloadId } from 'src/logic-functions/utils/update-fathom-media-download-id.util';
import { isDefined } from 'src/utils/is-defined';

const MAX_RATE_LIMIT_RETRIES = 3;

export const runFathomMediaImport = async (rawPayload: unknown) => {
  const payload = fathomMediaImportPayloadSchema.parse(rawPayload);
  const { callRecordingId, attempt } = payload;
  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const recordingContext = { coreApiClient, callRecordingId };
  const claim = await claimFathomMediaImport({
    ...recordingContext,
    now: new Date(),
  }).catch((error: unknown) => {
    throw buildRetryableFathomError({
      operation: `claim media import callRecordingId=${callRecordingId}`,
      error,
    });
  });

  try {
    const target = await resolveFathomMediaImportTarget(recordingContext);

    if (target.status === 'skipped') {
      await completeFathomCallRecordingImport(recordingContext);

      return { success: true, outcome: 'skipped' };
    }

    if (
      isDefined(payload.downloadId) &&
      payload.downloadId !== target.downloadId
    ) {
      return { success: true, outcome: 'stale' };
    }

    const enqueueNextAttempt = async ({
      downloadId,
      nextAttempt = attempt,
      rateLimitAttempt = payload.rateLimitAttempt,
      delay,
    }: {
      downloadId: string | undefined;
      nextAttempt?: number;
      rateLimitAttempt?: number;
      delay?: number;
    }) => {
      const options = {
        callRecordingId,
        connectedAccountId: target.connectedAccountId,
        rateLimitAttempt,
        notBeforeDelayMilliseconds: delay,
      };

      if (isDefined(downloadId)) {
        await enqueueFathomMediaDownloadPoll({
          ...options,
          downloadId,
          attempt: nextAttempt,
        });
      } else {
        await enqueueFathomMediaDownloadRequest(options);
      }
    };

    if (!isDefined(claim)) {
      await enqueueNextAttempt({
        downloadId: target.downloadId,
        delay: FATHOM_MEDIA_IMPORT_CLAIM_DURATION_MILLISECONDS,
      });

      return { success: true, outcome: 'in-progress' };
    }

    let writeContext = {
      connectedAccountId: target.connectedAccountId,
      claimedAt: claim.claimedAt,
      downloadId: target.downloadId ?? null,
    };

    try {
      const connection = await getConnection(target.connectedAccountId);
      const fathomClient = new Fathom({
        security: { bearerAuth: connection.accessToken },
        retryConfig: { strategy: 'none' },
      });
      let download: Pick<
        RecordingDownload,
        'downloadId' | 'status' | 'failureReason' | 'video' | 'audio'
      >;

      if (
        isDefined(target.uploadCheckpoint) &&
        target.uploadCheckpoint.downloadId === target.downloadId
      ) {
        download = { downloadId: target.downloadId, status: 'completed' };
      } else if (isDefined(target.downloadId)) {
        download = await fathomClient.getRecordingDownload({
          recordingId: target.recordingId,
          downloadId: target.downloadId,
        });
      } else {
        download = await fathomClient.createRecordingDownload({
          recordingId: target.recordingId,
        });
      }

      if (!isDefined(download.downloadId)) {
        throw new Error('Fathom download did not return an identifier');
      }

      if (!isDefined(target.downloadId)) {
        const isApplied = await updateFathomMediaDownloadId({
          ...recordingContext,
          writeContext,
          downloadId: download.downloadId,
        });

        if (!isApplied) {
          return { success: true, outcome: 'stale' };
        }
      }

      writeContext = { ...writeContext, downloadId: download.downloadId };
      const outcome = await applyFathomMediaDownload({
        ...recordingContext,
        writeContext: { ...writeContext, downloadId: download.downloadId },
        uploadCheckpoint: target.uploadCheckpoint,
        download,
      });

      if (outcome !== 'pending') {
        return { success: true, outcome };
      }

      if (attempt + 1 >= FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS) {
        const isApplied = await recordFathomMediaFailure({
          ...recordingContext,
          writeContext,
          reason: FATHOM_MEDIA_FAILURE_REASON.DOWNLOAD_TIMED_OUT,
        });

        return { success: true, outcome: isApplied ? 'unavailable' : 'stale' };
      }

      await enqueueNextAttempt({
        downloadId: download.downloadId,
        nextAttempt: attempt + 1,
        rateLimitAttempt: 0,
      });

      return { success: true, outcome: 'pending' };
    } catch (error) {
      const retryDelay = getFathomRetryAfterDelay({ error, now: new Date() });

      if (
        isDefined(retryDelay) &&
        (payload.rateLimitAttempt ?? 0) < MAX_RATE_LIMIT_RETRIES
      ) {
        await enqueueNextAttempt({
          downloadId: writeContext.downloadId ?? undefined,
          rateLimitAttempt: (payload.rateLimitAttempt ?? 0) + 1,
          delay: retryDelay,
        });

        return { success: true, outcome: 'rate-limited' };
      }

      const failureReason = isDefined(retryDelay)
        ? 'rate_limit_exhausted'
        : getFathomMediaFailureReasonForError(error);

      if (!isDefined(failureReason)) {
        throw error;
      }

      const isApplied = await recordFathomMediaFailure({
        ...recordingContext,
        writeContext,
        reason: failureReason,
      });

      return { success: true, outcome: isApplied ? 'unavailable' : 'stale' };
    }
  } catch (error) {
    throw buildRetryableFathomError({
      operation: `media import callRecordingId=${callRecordingId}`,
      error,
    });
  } finally {
    if (isDefined(claim)) {
      await releaseFathomMediaImportClaim({
        ...recordingContext,
        claim,
      }).catch((error: unknown) => {
        throw buildRetryableFathomError({
          operation: `release media import callRecordingId=${callRecordingId}`,
          error,
        });
      });
    }
  }
};
