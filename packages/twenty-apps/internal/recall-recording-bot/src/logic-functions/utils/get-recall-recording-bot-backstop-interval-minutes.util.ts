import { getRecallRecordingBotCronIntervalMinutes } from 'src/logic-functions/constants/get-recall-recording-bot-cron-interval-minutes';
import { RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-cron-interval-minutes-env-var-name';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';

export const getRecallRecordingBotBackstopIntervalMinutes = (): number =>
  getRecallRecordingBotCronIntervalMinutes(
    getApplicationVariableValue(
      RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME,
    ),
  );
