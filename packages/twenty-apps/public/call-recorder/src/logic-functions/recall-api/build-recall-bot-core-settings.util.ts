import { getRecallBotAutomaticLeave } from 'src/logic-functions/constants/recall-bot-automatic-leave';
import { getRecallBotRecordingConfig } from 'src/logic-functions/constants/recall-bot-recording-config';
import { computeRecallBotDetectionActivateAfterSeconds } from 'src/logic-functions/domain/compute-recall-bot-detection-activate-after-seconds.util';

type RecallBotCoreSettings = {
  bot_name: string;
  automatic_leave: ReturnType<typeof getRecallBotAutomaticLeave>;
  recording_config: ReturnType<typeof getRecallBotRecordingConfig>;
};

export const buildRecallBotCoreSettings = ({
  botName,
  botJoinsAt,
  meetingStartsAt,
}: {
  botName: string;
  botJoinsAt: string;
  meetingStartsAt: string;
}): RecallBotCoreSettings => ({
  bot_name: botName,
  automatic_leave: getRecallBotAutomaticLeave({
    botDetectionActivateAfterSeconds:
      computeRecallBotDetectionActivateAfterSeconds({
        botJoinsAt,
        meetingStartsAt,
      }),
    botName,
  }),
  recording_config: getRecallBotRecordingConfig(),
});
