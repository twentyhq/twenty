import { DEFAULT_CRON_INTERVAL_MINUTES } from 'src/logic-functions/constants/default-cron-interval-minutes';
import { RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME } from 'src/logic-functions/constants/recall-recording-bot-cron-interval-minutes-env-var-name';
import { SUPPORTED_CRON_INTERVAL_MINUTES } from 'src/logic-functions/constants/supported-cron-interval-minutes';

export const getRecallRecordingBotCronIntervalMinutes = (
  rawIntervalMinutes =
    process.env[RECALL_RECORDING_BOT_CRON_INTERVAL_MINUTES_ENV_VAR_NAME],
): number => {
  if (rawIntervalMinutes === undefined || rawIntervalMinutes.trim() === '') {
    return DEFAULT_CRON_INTERVAL_MINUTES;
  }

  const intervalMinutes = Number(rawIntervalMinutes);

  if (!isSupportedCronIntervalMinutes(intervalMinutes)) {
    return DEFAULT_CRON_INTERVAL_MINUTES;
  }

  return intervalMinutes;
};

const isSupportedCronIntervalMinutes = (
  intervalMinutes: number,
): intervalMinutes is (typeof SUPPORTED_CRON_INTERVAL_MINUTES)[number] =>
  SUPPORTED_CRON_INTERVAL_MINUTES.some(
    (supportedIntervalMinutes) =>
      supportedIntervalMinutes === intervalMinutes,
  );
