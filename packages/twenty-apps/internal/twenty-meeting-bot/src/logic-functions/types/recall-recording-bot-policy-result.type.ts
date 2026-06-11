import { type RecallRecordingBotPolicyNotRequiredReason } from 'src/logic-functions/types/recall-recording-bot-policy-not-required-reason.type';
import { type RecallRecordingBotPolicyRequiredReason } from 'src/logic-functions/types/recall-recording-bot-policy-required-reason.type';

export type RecallRecordingBotPolicyResult =
  | {
      shouldRequestBot: true;
      reason: RecallRecordingBotPolicyRequiredReason;
    }
  | {
      shouldRequestBot: false;
      reason: RecallRecordingBotPolicyNotRequiredReason;
    };
