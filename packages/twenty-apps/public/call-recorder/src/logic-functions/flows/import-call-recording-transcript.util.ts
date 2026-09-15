import { isArray, isNull, isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TRANSCRIPT_EXPIRED_SUB_CODE } from 'src/logic-functions/constants/transcript-expired-sub-code';
import { buildEmptyTranscriptMarker } from 'src/logic-functions/domain/build-empty-transcript-marker.util';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { buildPendingTranscriptMarker } from 'src/logic-functions/domain/build-pending-transcript-marker.util';
import { buildTranscriptFailureReason } from 'src/logic-functions/domain/build-transcript-failure-reason.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';
import { listRecallTranscripts } from 'src/logic-functions/recall-api/list-recall-transcripts.util';
import {
  isRecallAccountStatus,
  isRetryableRecallApiStatus,
} from 'src/logic-functions/recall-api/recall-api-retry-policy.util';
import { type RecallTranscriptSummary } from 'src/logic-functions/recall-api/recall-transcript-summary.type';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { type ImportCallRecordingTranscriptResult } from 'src/logic-functions/flows/import-call-recording-transcript-result.type';

type CallRecordingTranscriptArtifactUpdateFields =
  ImportCallRecordingTranscriptResult['updateData'];

export const importCallRecordingTranscript = async ({
  callRecordingId,
  currentStatus,
  externalRecordingId,
  requestedAt,
  transcript,
  isMediaExpired,
}: {
  callRecordingId: string;
  currentStatus: string | undefined;
  externalRecordingId: string | undefined;
  requestedAt: string;
  transcript: unknown;
  isMediaExpired: boolean;
}): Promise<ImportCallRecordingTranscriptResult> => {
  const existingTranscriptMarker = parseTranscriptMarker(transcript);

  if (
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    isUndefined(existingTranscriptMarker)
  ) {
    return buildEmptyTranscriptArtifactResult();
  }

  if (
    existingTranscriptMarker?.status === 'FAILED' ||
    existingTranscriptMarker?.status === 'EMPTY'
  ) {
    return buildEmptyTranscriptArtifactResult();
  }

  if (isUndefined(externalRecordingId)) {
    return isMediaExpired
      ? buildExpiredTranscriptArtifactResult({
          recallTranscriptId:
            existingTranscriptMarker?.recallTranscriptId ?? null,
        })
      : buildEmptyTranscriptArtifactResult();
  }

  const listResult = await listRecallTranscripts({ externalRecordingId });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to list Recall transcripts for recording ${externalRecordingId}: ${listResult.errorMessage}`,
    );

    return buildEmptyTranscriptArtifactResult({
      hasRetryableFailure:
        isNull(listResult.status) ||
        isRetryableRecallApiStatus(listResult.status),
    });
  }

  const transcriptArtifact = selectRecallTranscriptArtifact(
    listResult.transcripts,
  );
  const pendingTranscriptMarkerRecallTranscriptId =
    existingTranscriptMarker?.status === 'PENDING'
      ? (existingTranscriptMarker.recallTranscriptId ?? undefined)
      : undefined;
  const transcriptIdToDownload =
    transcriptArtifact?.id ?? pendingTranscriptMarkerRecallTranscriptId;

  if (
    isUndefined(transcriptArtifact) &&
    isUndefined(pendingTranscriptMarkerRecallTranscriptId)
  ) {
    if (isMediaExpired) {
      return buildExpiredTranscriptArtifactResult({ recallTranscriptId: null });
    }

    const createResult = await createAsyncRecallTranscript({
      externalRecordingId,
    });

    if (!createResult.ok) {
      console.warn(
        `[call-recorder] failed to request transcript for Recall recording ${externalRecordingId}: ${createResult.errorMessage}`,
      );

      // A lost response may still have created the transcript, and the next
      // run lists transcripts before requesting a new one.
      if (isNull(createResult.status)) {
        return buildEmptyTranscriptArtifactResult();
      }

      if (isRetryableRecallApiStatus(createResult.status)) {
        return buildEmptyTranscriptArtifactResult({
          hasRetryableFailure: true,
        });
      }

      if (isRecallAccountStatus(createResult.status)) {
        return buildEmptyTranscriptArtifactResult();
      }

      return {
        updateData: {
          transcript: buildEmptyTranscriptMarker({
            recallTranscriptId: null,
            subCode: `transcript_request_rejected:${createResult.status}`,
          }),
        },
        requestedTranscript: false,
        hasRetryableFailure: false,
      };
    }

    return {
      updateData: {
        transcript: buildPendingTranscriptMarker({
          recallTranscriptId: createResult.transcriptId,
          requestedAt,
        }),
      },
      requestedTranscript: true,
      hasRetryableFailure: false,
    };
  }

  if (
    !isUndefined(transcriptArtifact) &&
    (transcriptArtifact.statusCode === 'failed' ||
      transcriptArtifact.statusCode === 'error')
  ) {
    return {
      updateData: buildTranscriptFailureUpdate({
        currentStatus,
        transcriptId: transcriptArtifact.id,
        subCode: transcriptArtifact.statusSubCode ?? null,
      }),
      requestedTranscript: false,
      hasRetryableFailure: false,
    };
  }

  if (
    !isUndefined(transcriptArtifact) &&
    transcriptArtifact.statusCode !== 'done'
  ) {
    return buildEmptyTranscriptArtifactResult();
  }

  if (isUndefined(transcriptIdToDownload)) {
    return buildEmptyTranscriptArtifactResult();
  }

  const downloadResult = await downloadTranscript({
    transcriptId: transcriptIdToDownload,
  });

  if (downloadResult.outcome === 'filled') {
    // Twenty stores an empty JSON array as null, which would read as never imported.
    const isEmptyTranscript =
      isArray(downloadResult.content) && downloadResult.content.length === 0;

    return {
      updateData: {
        transcript: isEmptyTranscript
          ? buildEmptyTranscriptMarker({
              recallTranscriptId: transcriptIdToDownload,
            })
          : (downloadResult.content as Record<string, unknown>),
      },
      requestedTranscript: false,
      hasRetryableFailure: false,
    };
  }

  if (downloadResult.outcome === 'deleted') {
    return buildExpiredTranscriptArtifactResult({
      recallTranscriptId: transcriptIdToDownload,
    });
  }

  if (downloadResult.outcome === 'failed') {
    return {
      updateData: buildTranscriptFailureUpdate({
        currentStatus,
        transcriptId: transcriptIdToDownload,
        subCode: downloadResult.subCode,
      }),
      requestedTranscript: false,
      hasRetryableFailure: false,
    };
  }

  if (downloadResult.outcome === 'error') {
    console.warn(
      `[call-recorder] could not fill transcript for call recording ${callRecordingId}: ${downloadResult.errorMessage}`,
    );

    return buildEmptyTranscriptArtifactResult({ hasRetryableFailure: true });
  }

  return buildEmptyTranscriptArtifactResult();
};

const buildEmptyTranscriptArtifactResult = ({
  hasRetryableFailure = false,
}: {
  hasRetryableFailure?: boolean;
} = {}): ImportCallRecordingTranscriptResult => ({
  updateData: {},
  requestedTranscript: false,
  hasRetryableFailure,
});

const buildExpiredTranscriptArtifactResult = ({
  recallTranscriptId,
}: {
  recallTranscriptId: string | null;
}): ImportCallRecordingTranscriptResult => ({
  updateData: {
    transcript: buildEmptyTranscriptMarker({
      recallTranscriptId,
      subCode: TRANSCRIPT_EXPIRED_SUB_CODE,
    }),
  },
  requestedTranscript: false,
  hasRetryableFailure: false,
});

const selectRecallTranscriptArtifact = (
  transcripts: RecallTranscriptSummary[],
): RecallTranscriptSummary | undefined =>
  transcripts.find((transcript) => transcript.statusCode !== 'deleted');

const buildTranscriptFailureUpdate = ({
  currentStatus,
  transcriptId,
  subCode,
}: {
  currentStatus: string | undefined;
  transcriptId: string;
  subCode: string | null;
}): CallRecordingTranscriptArtifactUpdateFields => ({
  transcript: buildFailedTranscriptMarker({
    recallTranscriptId: transcriptId,
    subCode,
  }),
  callRecorderFailureReason: buildTranscriptFailureReason(subCode),
  ...(isCallRecordingStatusDowngrade({
    fromStatus: currentStatus,
    toStatus: CallRecordingStatus.FAILED,
  })
    ? {}
    : { status: CallRecordingStatus.FAILED }),
});
