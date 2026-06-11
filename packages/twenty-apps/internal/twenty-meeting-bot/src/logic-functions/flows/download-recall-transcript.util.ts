import { isUndefined } from '@sniptt/guards';

import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';

export type DownloadRecallTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  // subCode null matches the persisted failed-marker shape.
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'error'; errorMessage: string };

// Shared by the webhook and the cron re-check so both fill identical content.
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

  if (!isUndefined(downloadUrl)) {
    return downloadRecallTranscriptContent(downloadUrl);
  }

  if (statusCode === 'error' || statusCode === 'failed') {
    return { outcome: 'failed', subCode: statusSubCode ?? null };
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
