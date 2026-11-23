import { isUndefined } from '@sniptt/guards';

import { buildRecallBotCoreSettings } from 'src/logic-functions/recall-api/build-recall-bot-core-settings.util';
import { type RecallBotResponse } from 'src/logic-functions/recall-api/extract-recall-bot-id.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { getRecallBotChatConfig } from 'src/logic-functions/recall-api/get-recall-bot-chat-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { type RecallBotOperationFailure } from 'src/logic-functions/types/recall-bot-operation-result.type';

export const updateRecallBotSettings = async ({
  externalBotId,
  meetingStartsAt,
  joinAt,
  automaticVideoOutput,
}: {
  externalBotId: string;
  meetingStartsAt: string;
  joinAt: string;
  automaticVideoOutput: RecallBotAutomaticVideoOutput | null | undefined;
}): Promise<{ ok: true } | RecallBotOperationFailure> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'PATCH',
    body: {
      ...buildRecallBotCoreSettings({
        botName: configResult.config.botName,
        botJoinsAt: joinAt,
        meetingStartsAt,
      }),
      chat: getRecallBotChatConfig() ?? null,
      ...(isUndefined(automaticVideoOutput)
        ? {}
        : { automatic_video_output: automaticVideoOutput }),
    },
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true };
};
