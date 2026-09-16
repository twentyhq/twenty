import { isUndefined } from '@sniptt/guards';
import { type RecallBotOperationFailure } from 'src/logic-functions/types/RecallBotOperationFailure';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/utils/getRecallApiConfig';
import { getString } from 'src/logic-functions/utils/getString';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/utils/recallBotApiRequest';
import { type RecallTranscriptDetails } from 'src/logic-functions/types/RecallTranscriptDetails';

type RetrieveRecallTranscriptResult =
  | { ok: true; transcript: RecallTranscriptDetails }
  | RecallBotOperationFailure;

export const retrieveRecallTranscript = async ({
  transcriptId,
}: {
  transcriptId: string;
}): Promise<RetrieveRecallTranscriptResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<Record<string, unknown>>({
    config: configResult.config,
    path: `/transcript/${transcriptId}/`,
    method: 'GET',
  });

  if (!result.ok) {
    return result;
  }

  const transcript = extractRecallTranscriptDetails(result.data);

  if (isMalformedRecallTranscriptDetails(transcript)) {
    return {
      ok: false,
      status: result.status,
      errorMessage: 'Recall API returned malformed transcript details',
    };
  }

  return { ok: true, transcript };
};

const extractRecallTranscriptDetails = (
  response: Record<string, unknown> | undefined,
): RecallTranscriptDetails => {
  const data = asRecord(response?.data);
  const status = asRecord(response?.status);

  return {
    downloadUrl: getString(data?.download_url),
    statusCode: getString(status?.code),
    statusSubCode: getString(status?.sub_code),
  };
};

const isMalformedRecallTranscriptDetails = ({
  downloadUrl,
  statusCode,
}: RecallTranscriptDetails): boolean =>
  (isUndefined(downloadUrl) && isUndefined(statusCode)) ||
  (isUndefined(downloadUrl) && statusCode === 'done');
