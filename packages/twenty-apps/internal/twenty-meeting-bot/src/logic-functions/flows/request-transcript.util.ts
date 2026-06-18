import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';
import { buildPendingTranscriptMarker } from 'src/logic-functions/domain/build-pending-transcript-marker.util';
import { createAsyncRecallTranscript } from 'src/logic-functions/recall-api/create-async-recall-transcript.util';

export const requestTranscript = async ({
  externalRecordingId,
  requestedAt,
}: {
  externalRecordingId: string;
  requestedAt: string;
}): Promise<TranscriptMarker | null> => {
  const result = await createAsyncRecallTranscript({ externalRecordingId });

  if (!result.ok) {
    console.warn(
      `[twenty-meeting-bot] failed to request transcript for Recall recording ${externalRecordingId}: ${result.errorMessage}`,
    );

    return null;
  }

  return buildPendingTranscriptMarker({
    recallTranscriptId: result.transcriptId,
    requestedAt,
  });
};
