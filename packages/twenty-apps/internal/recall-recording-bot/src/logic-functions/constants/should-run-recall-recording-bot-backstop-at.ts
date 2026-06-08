import { getRecallRecordingBotCronIntervalMinutes } from 'src/logic-functions/constants/get-recall-recording-bot-cron-interval-minutes';

export const shouldRunRecallRecordingBotBackstopAt = ({
  now,
  intervalMinutes = getRecallRecordingBotCronIntervalMinutes(),
}: {
  now: Date;
  intervalMinutes?: number;
}): boolean => now.getUTCMinutes() % intervalMinutes === 0;
