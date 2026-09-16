import { isUndefined } from '@sniptt/guards';

import { RECALL_API_NOT_FOUND_STATUS } from 'src/logic-functions/constants/recall-api-not-found-status';
import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';

const TRANSCRIPT_DOWNLOAD_TIMEOUT_MS = 20_000;

export type DownloadTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'deleted' }
  | { outcome: 'error'; errorMessage: string };

export const downloadTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<DownloadTranscriptResult> => {
  const retrieveResult = await retrieveRecallTranscript({ transcriptId });

  if (!retrieveResult.ok) {
    return retrieveResult.status === RECALL_API_NOT_FOUND_STATUS
      ? { outcome: 'deleted' }
      : { outcome: 'error', errorMessage: retrieveResult.errorMessage };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (!isUndefined(downloadUrl)) {
    return downloadTranscriptContent(downloadUrl);
  }

  if (statusCode === 'error' || statusCode === 'failed') {
    return { outcome: 'failed', subCode: statusSubCode ?? null };
  }

  if (statusCode === 'deleted') {
    return { outcome: 'deleted' };
  }

  return { outcome: 'pending' };
};

const downloadTranscriptContent = async (
  downloadUrl: string,
): Promise<DownloadTranscriptResult> => {
  try {
    const response = await fetch(downloadUrl, {
      signal: AbortSignal.timeout(TRANSCRIPT_DOWNLOAD_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(
        `[call-recorder] transcript download responded with HTTP ${response.status}`,
      );

      return {
        outcome: 'error',
        errorMessage: 'transcript download failed',
      };
    }

    return { outcome: 'filled', content: await response.json() };
  } catch (error) {
    console.warn(
      `[call-recorder] transcript download failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return {
      outcome: 'error',
      errorMessage: 'transcript download failed',
    };
  }
};
