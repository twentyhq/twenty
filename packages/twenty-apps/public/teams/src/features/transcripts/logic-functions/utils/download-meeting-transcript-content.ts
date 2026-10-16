import { GRAPH_ATTRIBUTED_TRANSCRIPT_FORMAT } from 'src/features/transcripts/logic-functions/constants/graph-attributed-transcript-format';
import { GRAPH_SPEAKER_ATTRIBUTION_NOT_ALLOWED_ERROR_CODE } from 'src/features/transcripts/logic-functions/constants/graph-speaker-attribution-not-allowed-error-code';
import { GRAPH_UNATTRIBUTED_TRANSCRIPT_FORMAT } from 'src/features/transcripts/logic-functions/constants/graph-unattributed-transcript-format';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptContent } from 'src/features/transcripts/logic-functions/types/teams-transcript-content.type';
import { fetchGraphText } from 'src/features/transcripts/logic-functions/utils/fetch-graph-text';

export const downloadMeetingTranscriptContent = async ({
  accessToken,
  meetingId,
  transcriptId,
}: {
  accessToken: string;
  meetingId: string;
  transcriptId: string;
}): Promise<TeamsTranscriptContent> => {
  const transcriptContentUrl = `me/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts/${encodeURIComponent(transcriptId)}/content`;

  try {
    return {
      content: await fetchGraphText({
        accessToken,
        url: transcriptContentUrl,
        accept: GRAPH_ATTRIBUTED_TRANSCRIPT_FORMAT,
      }),
      isSpeakerAttributed: true,
    };
  } catch (error) {
    if (
      !(error instanceof GraphRequestError) ||
      error.innerErrorCode !== GRAPH_SPEAKER_ATTRIBUTION_NOT_ALLOWED_ERROR_CODE
    ) {
      throw error;
    }

    return {
      content: await fetchGraphText({
        accessToken,
        url: transcriptContentUrl,
        accept: GRAPH_UNATTRIBUTED_TRANSCRIPT_FORMAT,
      }),
      isSpeakerAttributed: false,
    };
  }
};
