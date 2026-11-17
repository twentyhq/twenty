import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { RECALL_BOT_SETTINGS_UPDATE_CUTOFF_MINUTES } from 'src/logic-functions/constants/recall-bot-settings-update-cutoff-minutes';

export const isRecallBotJoinWithinSettingsUpdateCutoff = ({
  joinAt,
  now,
}: {
  joinAt: string;
  now: Date;
}): boolean =>
  new Date(joinAt).getTime() - now.getTime() <=
  RECALL_BOT_SETTINGS_UPDATE_CUTOFF_MINUTES * MILLISECONDS_PER_MINUTE;
