import { isUndefined } from '@sniptt/guards';

import { RECALL_BOT_AUTOMATIC_LEAVE } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { RECALL_BOT_RECORDING_CONFIG } from 'src/logic-functions/constants/recall-bot-recording-config';
import { type RecallBotMetadata } from 'src/logic-functions/types/recall-bot-metadata.type';
import { type RecallBotScheduleResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import {
  extractRecallBotId,
  type RecallBotResponse,
} from 'src/logic-functions/recall-api/extract-recall-bot-id.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export type ScheduleRecallRecordingBotArgs = {
  meetingUrl: string;
  joinAt: string;
  metadata: RecallBotMetadata;
};

export const scheduleRecallRecordingBot = async ({
  meetingUrl,
  joinAt,
  metadata,
}: ScheduleRecallRecordingBotArgs): Promise<RecallBotScheduleResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: '/bot/',
    method: 'POST',
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

  const externalBotId = extractRecallBotId(result.data);

  if (isUndefined(externalBotId)) {
    return {
      ok: false,
      status: null,
      errorMessage:
        'Recall API created a bot but the response did not include a bot id',
    };
  }

  return {
    ok: true,
    externalBotId,
  };
};
