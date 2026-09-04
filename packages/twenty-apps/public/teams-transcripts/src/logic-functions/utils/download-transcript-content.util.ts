import {
  GRAPH_ATTRIBUTED_TRANSCRIPT_FORMAT,
  GRAPH_SPEAKER_ATTRIBUTION_DISABLED_ERROR_CODE,
  GRAPH_UNATTRIBUTED_TRANSCRIPT_FORMAT,
} from 'src/constants/teams.constant';
import { graphFetchText } from 'src/logic-functions/utils/graph-fetch.util';
import { GraphRequestError } from 'src/logic-functions/utils/graph-request-error';

// A tenant that disallows speaker attribution rejects text/vtt with a
// dedicated error code; the unattributed format then still returns the words.
export const downloadTranscriptContent = async ({
  accessToken,
  transcriptContentUrl,
}: {
  accessToken: string;
  transcriptContentUrl: string;
}): Promise<{ content: string; isSpeakerAttributed: boolean }> => {
  try {
    const content = await graphFetchText({
      accessToken,
      url: transcriptContentUrl,
      accept: GRAPH_ATTRIBUTED_TRANSCRIPT_FORMAT,
    });

    return { content, isSpeakerAttributed: true };
  } catch (error) {
    if (
      !(error instanceof GraphRequestError) ||
      error.innerErrorCode !== GRAPH_SPEAKER_ATTRIBUTION_DISABLED_ERROR_CODE
    ) {
      throw error;
    }
  }

  const content = await graphFetchText({
    accessToken,
    url: transcriptContentUrl,
    accept: GRAPH_UNATTRIBUTED_TRANSCRIPT_FORMAT,
  });

  return { content, isSpeakerAttributed: false };
};
