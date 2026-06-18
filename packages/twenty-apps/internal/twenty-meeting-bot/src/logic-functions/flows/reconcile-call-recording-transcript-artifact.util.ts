import { isNull, isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { buildPendingTranscriptMarker } from 'src/logic-functions/domain/build-pending-transcript-marker.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';
import { listRecallTranscripts } from 'src/logic-functions/recall-api/list-recall-transcripts.util';
import { type RecallTranscriptSummary } from 'src/logic-functions/recall-api/recall-transcript-summary.type';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { type ReconcileCallRecordingTranscriptArtifactResult } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact-result.type';

type CallRecordingTranscriptArtifactUpdateFields =
  ReconcileCallRecordingTranscriptArtifactResult['updateData'];

export const reconcileCallRecordingTranscriptArtifact = async ({
  callRecordingId,
  currentStatus,
  externalRecordingId,
  requestedAt,
  transcript,
}: {
  callRecordingId: string;
  currentStatus: string | undefined;
  externalRecordingId: string;
  requestedAt: string;
  transcript: unknown;
}): Promise<ReconcileCallRecordingTranscriptArtifactResult> => {
  const existingTranscriptMarker = parseTranscriptMarker(transcript);

  if (
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    isUndefined(existingTranscriptMarker)
  ) {
    return buildEmptyTranscriptArtifactResult();
  }

  if (existingTranscriptMarker?.status === 'FAILED') {
    return buildEmptyTranscriptArtifactResult();
  }

  const listResult = await listRecallTranscripts({ externalRecordingId });

  if (!listResult.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to list Recall transcripts for recording ${externalRecordingId}: ${listResult.errorMessage}`,
    );

    return buildEmptyTranscriptArtifactResult();
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
    const createResult = await createAsyncRecallTranscript({
      externalRecordingId,
      callRecordingId,
    });

    if (!createResult.ok) {
      console.warn(
        `[twenty-meeting-bot] failed to request transcript for Recall recording ${externalRecordingId}: ${createResult.errorMessage}`,
      );

      return buildEmptyTranscriptArtifactResult();
    }

    return {
      updateData: {
        transcript: buildPendingTranscriptMarker({
          recallTranscriptId: createResult.transcriptId,
          requestedAt,
        }),
      },
      requestedTranscript: true,
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
    return {
      updateData: {
        transcript: downloadResult.content as Record<string, unknown>,
      },
      requestedTranscript: false,
    };
  }

  if (downloadResult.outcome === 'failed') {
    return {
      updateData: buildTranscriptFailureUpdate({
        currentStatus,
        transcriptId: transcriptIdToDownload,
        subCode: downloadResult.subCode,
      }),
      requestedTranscript: false,
    };
  }

  if (downloadResult.outcome === 'error') {
    console.warn(
      `[twenty-meeting-bot] could not fill transcript for call recording ${callRecordingId}: ${downloadResult.errorMessage}`,
    );
  }

  return buildEmptyTranscriptArtifactResult();
};

const buildEmptyTranscriptArtifactResult =
  (): ReconcileCallRecordingTranscriptArtifactResult => ({
    updateData: {},
    requestedTranscript: false,
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
  ...(isCallRecordingStatusDowngrade({
    fromStatus: currentStatus,
    toStatus: CallRecordingStatus.FAILED_UNKNOWN,
  })
    ? {}
    : { status: CallRecordingStatus.FAILED_UNKNOWN }),
});
