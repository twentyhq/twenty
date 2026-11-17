import { type ScheduledRecallBotCancellation } from 'src/logic-functions/types/scheduled-recall-bot-cancellation.type';

export type ScheduledRecallBotCancellationPlan = {
  minuteSlots: ScheduledRecallBotCancellation[][];
  unplannedCallRecordingCount: number;
};
