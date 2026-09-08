import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

type GetRecallRecordingResult =
  | { ok: true; recording: Record<string, unknown> }
  | RecallBotOperationFailure;

export const getRecallRecording = async ({
  externalRecordingId,
}: {
  externalRecordingId: string;
}): Promise<GetRecallRecordingResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<Record<string, unknown>>({
    config: configResult.config,
    path: `/recording/${externalRecordingId}/`,
    method: 'GET',
  });

  if (!result.ok) {
    return result;
  }

  if (
    !result.data ||
    typeof result.data !== 'object' ||
    Array.isArray(result.data)
  ) {
    return {
      ok: false,
      status: result.status,
      errorMessage: 'Recall API returned no recording payload',
    };
  }
  return { ok: true, recording: result.data };
};
