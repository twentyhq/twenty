import { isUndefined } from '@sniptt/guards';

import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { RECALL_BOT_RECORDING_CONFIG } from 'src/logic-functions/constants/recall-bot-recording-config';
import { type RecallBotScheduleResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import {
  extractRecallBotId,
  type RecallBotResponse,
} from 'src/logic-functions/recall-api/extract-recall-bot-id.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';
import { type ScheduleRecallBotArgs } from 'src/logic-functions/recall-api/schedule-recall-bot.util';

type RescheduleRecallBotArgs = ScheduleRecallBotArgs & {
  externalBotId: string;
};

export const rescheduleRecallBot = async ({
  externalBotId,
  meetingUrl,
  joinAt,
  metadata,
}: RescheduleRecallBotArgs): Promise<RecallBotScheduleResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const automaticLeave = getRecallBotAutomaticLeave();

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'PATCH',
    body: {
      meeting_url: meetingUrl,
      join_at: joinAt,
      bot_name: configResult.config.botName,
      ...(isUndefined(automaticLeave) ? {} : { automatic_leave: automaticLeave }),
      recording_config: RECALL_BOT_RECORDING_CONFIG,
      metadata,
    },
  });

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    externalBotId: extractRecallBotId(result.data) ?? externalBotId,
  };
};
