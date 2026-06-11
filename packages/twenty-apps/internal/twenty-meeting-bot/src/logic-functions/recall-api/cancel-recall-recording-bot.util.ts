import { type RecallBotRemovalResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export const cancelRecallRecordingBot = async ({
  externalBotId,
}: {
  externalBotId: string;
}): Promise<RecallBotRemovalResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<undefined>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'DELETE',
    allowNotFound: true,
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true };
};
