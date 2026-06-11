import { retrieveRecallTranscript } from 'src/logic-functions/utils/recall-bot-api.util';

export type DownloadRecallTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'error'; errorMessage: string };

// Shared by the transcript.done webhook and the backstop pending-marker
// re-check so both fill the transcript field with identical content.
export const downloadRecallTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<DownloadRecallTranscriptResult> => {
  const retrieveResult = await retrieveRecallTranscript({ transcriptId });

  if (!retrieveResult.ok) {
    return { outcome: 'error', errorMessage: retrieveResult.errorMessage };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (downloadUrl !== null) {
    return downloadRecallTranscriptContent(downloadUrl);
  }

  if (statusCode === 'error' || statusCode === 'failed') {
    return { outcome: 'failed', subCode: statusSubCode };
  }

  return { outcome: 'pending' };
};

const downloadRecallTranscriptContent = async (
  downloadUrl: string,
): Promise<DownloadRecallTranscriptResult> => {
  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      return {
        outcome: 'error',
        errorMessage: `transcript download responded with HTTP ${response.status}`,
      };
    }

    return { outcome: 'filled', content: await response.json() };
  } catch (error) {
    return {
      outcome: 'error',
      errorMessage: `transcript download failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
