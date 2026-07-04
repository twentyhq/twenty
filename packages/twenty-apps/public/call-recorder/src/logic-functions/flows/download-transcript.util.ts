import { isUndefined } from '@sniptt/guards';

import { TranscriptDownloadOutcome } from 'src/logic-functions/constants/transcript-download-outcome';
import { retrieveRecallTranscript } from 'src/logic-functions/recall-api/retrieve-recall-transcript.util';

const TRANSCRIPT_DOWNLOAD_TIMEOUT_MS = 20_000;

export type DownloadTranscriptResult =
  | { outcome: typeof TranscriptDownloadOutcome.FILLED; content: unknown }
  | {
      outcome: typeof TranscriptDownloadOutcome.FAILED;
      subCode: string | null;
    }
  | { outcome: typeof TranscriptDownloadOutcome.PENDING }
  | {
      outcome: typeof TranscriptDownloadOutcome.ERROR;
      errorMessage: string;
    };

export const downloadTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<DownloadTranscriptResult> => {
  const retrieveResult = await retrieveRecallTranscript({ transcriptId });

  if (!retrieveResult.ok) {
    return {
      outcome: TranscriptDownloadOutcome.ERROR,
      errorMessage: retrieveResult.errorMessage,
    };
  }

  const { downloadUrl, statusCode, statusSubCode } = retrieveResult.transcript;

  if (!isUndefined(downloadUrl)) {
    return downloadTranscriptContent(downloadUrl);
  }

  if (statusCode === 'error' || statusCode === 'failed') {
    return {
      outcome: TranscriptDownloadOutcome.FAILED,
      subCode: statusSubCode ?? null,
    };
  }

  return { outcome: TranscriptDownloadOutcome.PENDING };
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
        outcome: TranscriptDownloadOutcome.ERROR,
        errorMessage: 'transcript download failed',
      };
    }

    return {
      outcome: TranscriptDownloadOutcome.FILLED,
      content: await response.json(),
    };
  } catch (error) {
    console.warn(
      `[call-recorder] transcript download failed: ${error instanceof Error ? error.message : String(error)}`,
    );

    return {
      outcome: TranscriptDownloadOutcome.ERROR,
      errorMessage: 'transcript download failed',
    };
  }
};
