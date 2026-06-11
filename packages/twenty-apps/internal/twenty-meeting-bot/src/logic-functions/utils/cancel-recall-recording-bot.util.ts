import { type RecallBotOperationResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';

export const cancelRecallRecordingBot = async ({
  externalBotId,
}: {
  externalBotId: string;
}): Promise<RecallBotOperationResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<undefined>({
    apiKey: configResult.config.apiKey,
    baseUrl: configResult.config.baseUrl,
    path: `/bot/${externalBotId}/`,
    method: 'DELETE',
    allowNotFound: true,
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    externalBotId: null,
  };
};
