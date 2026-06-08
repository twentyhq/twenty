import { type RecallRecordingBotReconciliationAction } from 'src/logic-functions/types/recall-recording-bot-reconciliation-action.type';

export type RecallRecordingBotReconciliationResult = {
  action: RecallRecordingBotReconciliationAction;
  realMeetingKey: string;
  callRecordingId: string | null;
};
