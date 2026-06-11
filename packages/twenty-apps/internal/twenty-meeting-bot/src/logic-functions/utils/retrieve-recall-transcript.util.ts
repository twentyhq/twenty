import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';

export type RecallTranscriptDetails = {
  downloadUrl: string | null;
  statusCode: string | null;
  statusSubCode: string | null;
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
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
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
  const data = asNestedRecord(response?.data);
  const status = asNestedRecord(response?.status);

  return {
    downloadUrl: asNestedString(data?.download_url),
    statusCode: asNestedString(status?.code),
    statusSubCode: asNestedString(status?.sub_code),
  };
};

const asNestedRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asNestedString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;
