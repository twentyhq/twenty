import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { getRecallBotRecordingConfig } from 'src/logic-functions/constants/recall-bot-recording-config';
import { type RecallBotScheduleResult } from 'src/logic-functions/types/recall-bot-operation-result.type';
import {
  extractRecallBotId,
  type RecallBotResponse,
} from 'src/logic-functions/recall-api/extract-recall-bot-id.util';
import { computeRecallBotDetectionActivateAfterSeconds } from 'src/logic-functions/domain/compute-recall-bot-detection-activate-after-seconds.util';
import { getRecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { recallBotApiRequest } from 'src/logic-functions/recall-api/recall-bot-api-request.util';
import { type ScheduleRecallBotArgs } from 'src/logic-functions/recall-api/schedule-recall-bot.util';
import { computeMaximumJoinAt } from 'src/logic-functions/recall-api/compute-maximum-join-at.utils';

type RescheduleRecallBotArgs = ScheduleRecallBotArgs & {
  externalBotId: string;
};

export const rescheduleRecallBot = async ({
  externalBotId,
  meetingUrl,
  meetingStartsAt,
  joinAt,
  metadata,
}: RescheduleRecallBotArgs): Promise<RecallBotScheduleResult> => {
  const configResult = getRecallApiConfig();

  if (!configResult.success) {
    return { ok: false, status: null, errorMessage: configResult.error };
  }

  const effectiveJoinAt = computeMaximumJoinAt(joinAt);
  const automaticLeave = getRecallBotAutomaticLeave({
    botDetectionActivateAfterSeconds:
      computeRecallBotDetectionActivateAfterSeconds({
        botJoinsAt: effectiveJoinAt,
        meetingStartsAt,
      }),
    botName: configResult.config.botName,
  });

  const result = await recallBotApiRequest<RecallBotResponse>({
    config: configResult.config,
    path: `/bot/${externalBotId}/`,
    method: 'PATCH',
    body: {
      meeting_url: meetingUrl,
      join_at: effectiveJoinAt,
      bot_name: configResult.config.botName,
      automatic_leave: automaticLeave,
      recording_config: getRecallBotRecordingConfig(),
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
