import { isUndefined } from '@sniptt/guards';

import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { getRecallBotRecordingConfig } from 'src/logic-functions/constants/recall-bot-recording-config';
import { resolveBotName } from 'src/logic-functions/domain/resolve-bot-name.util';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { type RecallRoutingMetadata } from 'src/logic-functions/types/recall-routing-metadata.type';
import { type RecallBotScheduleResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import {
  extractRecallBotId,
  type RecallBotResponse,
} from 'src/logic-functions/recall-api/extract-recall-bot-id.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';

export type ScheduleRecallBotArgs = {
  meetingUrl: string;
  joinAt: string;
  metadata: RecallRoutingMetadata;
  automaticVideoOutput?: RecallBotAutomaticVideoOutput;
};

export const scheduleRecallBot = async ({
  meetingUrl,
  joinAt,
  metadata,
  automaticVideoOutput,
}: ScheduleRecallBotArgs): Promise<RecallBotScheduleResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const automaticLeave = getRecallBotAutomaticLeave();

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: '/bot/',
    method: 'POST',
    body: {
      meeting_url: meetingUrl,
      join_at: joinAt,
      bot_name: await resolveBotName(),
      ...(isUndefined(automaticLeave)
        ? {}
        : { automatic_leave: automaticLeave }),
      ...(isUndefined(automaticVideoOutput)
        ? {}
        : { automatic_video_output: automaticVideoOutput }),
      recording_config: getRecallBotRecordingConfig(),
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
