import { createAsyncRecallTranscript } from 'src/logic-functions/utils/recall-bot-api.util';
import {
  buildPendingRecallTranscriptMarker,
  type RecallTranscriptMarker,
} from 'src/logic-functions/utils/recall-transcript-marker.util';

// Every create_transcript call is billed; callers must only invoke this for a
// record whose transcript field is still null.
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
