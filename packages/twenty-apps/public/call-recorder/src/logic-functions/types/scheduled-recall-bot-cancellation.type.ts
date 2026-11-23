import { type CanceledCallRecordingBot } from 'src/logic-functions/types/canceled-call-recording-bot.type';

export type ScheduledRecallBotCancellation = Pick<
  CanceledCallRecordingBot,
  'callRecordingId' | 'externalBotId'
>;
