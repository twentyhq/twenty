import { isUndefined } from '@sniptt/guards';

import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';

const TRANSCRIPT_DOWNLOAD_TIMEOUT_MS = 20_000;

export type DownloadTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'error'; errorMessage: string };

export const downloadTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<DownloadTranscriptResult> => {
  const retrieveResult = await retrieveRecallTranscript({ transcriptId });

  if (!retrieveResult.ok) {
    return { outcome: 'error', errorMessage: retrieveResult.errorMessage };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (!isUndefined(downloadUrl)) {
    return downloadTranscriptContent(downloadUrl);
  }

  if (statusCode === 'error' || statusCode === 'failed') {
    return { outcome: 'failed', subCode: statusSubCode ?? null };
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
