import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { getString } from 'src/logic-functions/utils/get-string.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';

export type RecallTranscriptDetails = {
  downloadUrl: string | undefined;
  statusCode: string | undefined;
  statusSubCode: string | undefined;
};

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

  return { ok: true, transcript: extractRecallTranscriptDetails(result.data) };
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
