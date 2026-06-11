import { RECALL_BOT_AUTOMATIC_LEAVE } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { RECALL_BOT_RECORDING_CONFIG } from 'src/logic-functions/constants/recall-bot-recording-config';
import { type RecallBotScheduleResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import {
  extractRecallBotId,
  type RecallBotResponse,
} from 'src/logic-functions/utils/extract-recall-bot-id.util';
import { getRecallApiConfig } from 'src/logic-functions/utils/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/utils/recall-bot-api-request.util';
import { type ScheduleRecallRecordingBotArgs } from 'src/logic-functions/utils/schedule-recall-recording-bot.util';

type RescheduleRecallRecordingBotArgs = ScheduleRecallRecordingBotArgs & {
  externalBotId: string;
};

export const rescheduleRecallRecordingBot = async ({
  externalBotId,
  meetingUrl,
  joinAt,
  metadata,
}: RescheduleRecallRecordingBotArgs): Promise<RecallBotScheduleResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'PATCH',
    body: {
      meeting_url: meetingUrl,
      join_at: joinAt,
      bot_name: configResult.config.botName,
      automatic_leave: RECALL_BOT_AUTOMATIC_LEAVE,
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
