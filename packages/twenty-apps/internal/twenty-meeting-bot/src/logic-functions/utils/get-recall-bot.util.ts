import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';

type GetRecallBotResult =
  | { ok: true; bot: Record<string, unknown> }
  | RecallBotOperationFailure;

export const getRecallBot = async ({
  externalBotId,
}: {
  externalBotId: string;
}): Promise<GetRecallBotResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<Record<string, unknown>>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'GET',
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, bot: result.data ?? {} };
};
