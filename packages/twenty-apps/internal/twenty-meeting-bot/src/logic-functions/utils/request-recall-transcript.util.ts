import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';
import { buildPendingRecallTranscriptMarker } from 'src/logic-functions/utils/build-pending-recall-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/utils/create-async-recall-transcript.util';

// Billed per call; only invoke while the transcript field is still null.
export const requestRecallTranscript = async ({
  externalRecordingId,
  requestedAt,
}: {
  externalRecordingId: string;
  requestedAt: string;
}): Promise<RecallTranscriptMarker | null> => {
  const result = await createAsyncRecallTranscript({ externalRecordingId });

  if (!result.ok) {
    console.warn(
      `[recall-recording-bot] failed to request transcript for Recall recording ${externalRecordingId}: ${result.errorMessage}`,
    );

    return null;
  }

  return buildPendingRecallTranscriptMarker({
    recallTranscriptId: result.transcriptId,
    requestedAt,
  });
};
