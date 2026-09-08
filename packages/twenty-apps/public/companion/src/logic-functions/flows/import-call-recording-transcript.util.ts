import { isUndefined } from '@sniptt/guards';

import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { buildPendingTranscriptMarker } from 'src/logic-functions/domain/build-pending-transcript-marker.util';
import { buildTranscriptFailureReason } from 'src/logic-functions/domain/build-transcript-failure-reason.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';
import { listRecallTranscripts } from 'src/logic-functions/recall-api/list-recall-transcripts.util';
import { type RecallTranscriptSummary } from 'src/logic-functions/recall-api/recall-transcript-summary.type';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { type ImportCallRecordingTranscriptResult } from 'src/logic-functions/flows/import-call-recording-transcript-result.type';

type CallRecordingTranscriptArtifactUpdateFields =
  ImportCallRecordingTranscriptResult['updateData'];

export const importCallRecordingTranscript = async ({
  callRecordingId,
  externalRecordingId,
  requestedAt,
  transcript,
}: {
  callRecordingId: string;
  currentStatus: string | undefined;
  externalRecordingId: string;
  requestedAt: string;
  transcript: unknown;
}): Promise<ImportCallRecordingTranscriptResult> => {
  const existingTranscriptMarker = parseTranscriptMarker(transcript);

  if (Array.isArray(transcript) && isUndefined(existingTranscriptMarker)) {
    return buildEmptyTranscriptArtifactResult();
  }

  const listResult = await listRecallTranscripts({ externalRecordingId });

  if (!listResult.ok) {
    console.warn(
      `[companion] failed to list Recall transcripts for recording ${externalRecordingId}: ${listResult.errorMessage}`,
    );

    return buildEmptyTranscriptArtifactResult();
  }

  const pendingTranscriptMarkerRecallTranscriptId =
    existingTranscriptMarker?.recallTranscriptId ?? undefined;
  const transcriptArtifact = pendingTranscriptMarkerRecallTranscriptId
    ? listResult.transcripts.find(
        (artifact) => artifact.id === pendingTranscriptMarkerRecallTranscriptId,
      )
    : selectRecallTranscriptArtifact(listResult.transcripts);
  if (transcriptArtifact?.statusCode === 'deleted') {
    return { updateData: { transcript: null }, requestedTranscript: false };
  }
  const transcriptIdToDownload =
    pendingTranscriptMarkerRecallTranscriptId ?? transcriptArtifact?.id;

  if (
    isUndefined(transcriptArtifact) &&
    isUndefined(pendingTranscriptMarkerRecallTranscriptId)
  ) {
    // An uncertain create response must not trigger another paid transcription.
    if (existingTranscriptMarker) return buildEmptyTranscriptArtifactResult();
    const createResult = await createAsyncRecallTranscript({
      externalRecordingId,
    });

    if (!createResult.ok) {
      console.warn(
        `[companion] failed to request transcript for Recall recording ${externalRecordingId}: ${createResult.errorMessage}`,
      );

      return {
        updateData: {
          transcript: buildPendingTranscriptMarker({
            recallTranscriptId: null,
            requestedAt,
          }),
        },
        requestedTranscript: true,
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
    };
  }

  if (
    !isUndefined(transcriptArtifact) &&
    (transcriptArtifact.statusCode === 'failed' ||
      transcriptArtifact.statusCode === 'error')
  ) {
    return {
      updateData: buildTranscriptFailureUpdate({
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

  if (downloadResult.outcome === 'deleted') {
    return { updateData: { transcript: null }, requestedTranscript: false };
  }

  if (downloadResult.outcome === 'failed') {
    return {
      updateData: buildTranscriptFailureUpdate({
        transcriptId: transcriptIdToDownload,
        subCode: downloadResult.subCode,
      }),
      requestedTranscript: false,
    };
  }

  if (downloadResult.outcome === 'error') {
    console.warn(
      `[companion] could not fill transcript for call recording ${callRecordingId}: ${downloadResult.errorMessage}`,
    );
  }

  return buildEmptyTranscriptArtifactResult();
};

const buildEmptyTranscriptArtifactResult =
  (): ImportCallRecordingTranscriptResult => ({
    updateData: {},
    requestedTranscript: false,
  });

const selectRecallTranscriptArtifact = (
  transcripts: RecallTranscriptSummary[],
): RecallTranscriptSummary | undefined =>
  transcripts.find((transcript) => transcript.statusCode !== 'deleted');

const buildTranscriptFailureUpdate = ({
  transcriptId,
  subCode,
}: {
  transcriptId: string;
  subCode: string | null;
}): CallRecordingTranscriptArtifactUpdateFields => ({
  transcript: buildFailedTranscriptMarker({
    recallTranscriptId: transcriptId,
    subCode,
  }),
  companionFailureReason: buildTranscriptFailureReason(subCode),
});
