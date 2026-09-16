import { isUndefined } from '@sniptt/guards';

import { RECALL_API_NOT_FOUND_STATUS } from 'src/logic-functions/constants/recall-api-not-found-status';
import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';
import { buildAbortSignalWithTimeout } from 'src/logic-functions/utils/build-abort-signal-with-timeout.util';

const TRANSCRIPT_DOWNLOAD_TIMEOUT_MS = 20_000;

export type DownloadTranscriptResult =
  | { outcome: 'filled'; content: unknown }
  | { outcome: 'failed'; subCode: string | null }
  | { outcome: 'pending' }
  | { outcome: 'deleted' }
  | { outcome: 'error'; errorMessage: string };

export const downloadTranscript = async ({
  transcriptId,
  signal,
}: {
  transcriptId: string;
  signal?: AbortSignal;
}): Promise<DownloadTranscriptResult> => {
  const retrieveResult = await retrieveRecallTranscript({
    transcriptId,
    signal,
  });

  if (!retrieveResult.ok) {
    return retrieveResult.status === RECALL_API_NOT_FOUND_STATUS
      ? { outcome: 'deleted' }
      : { outcome: 'error', errorMessage: retrieveResult.errorMessage };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (!isUndefined(downloadUrl)) {
    return downloadTranscriptContent(downloadUrl, signal);
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
  signal?: AbortSignal,
): Promise<DownloadTranscriptResult> => {
  try {
    const response = await fetch(downloadUrl, {
      signal: buildAbortSignalWithTimeout({
        timeoutMs: TRANSCRIPT_DOWNLOAD_TIMEOUT_MS,
        signal,
      }),
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
