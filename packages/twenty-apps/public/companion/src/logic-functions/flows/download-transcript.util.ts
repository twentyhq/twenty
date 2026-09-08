import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isUndefined } from '@sniptt/guards';

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
    return { outcome: 'error', errorMessage: retrieveResult.errorMessage };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (statusCode === 'deleted') return { outcome: 'deleted' };

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
        `[companion] transcript download responded with HTTP ${response.status}`,
      );

      return {
        outcome: 'error',
        errorMessage: 'transcript download failed',
      };
    }

    const content: unknown = await response.json();
    if (
      !Array.isArray(content) ||
      !content.every((segment) => {
        const words = asRecord(segment)?.words;
        return (
          Array.isArray(words) &&
          words.every((word) => typeof asRecord(word)?.text === 'string')
        );
      })
    )
      return {
        outcome: 'error',
        errorMessage: 'Recall returned an invalid transcript',
      };
    return { outcome: 'filled', content };
  } catch (error) {
    console.warn(
      `[companion] transcript download failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return {
      outcome: 'error',
      errorMessage: 'transcript download failed',
    };
  }
};
