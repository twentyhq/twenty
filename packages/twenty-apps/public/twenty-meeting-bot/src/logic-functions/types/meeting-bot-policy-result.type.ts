import { type MeetingBotPolicyNotRequiredReason } from 'src/logic-functions/types/meeting-bot-policy-not-required-reason.type';
import { type MeetingBotPolicyRequiredReason } from 'src/logic-functions/types/meeting-bot-policy-required-reason.type';

export type MeetingBotPolicyResult =
  | {
      shouldRequestBot: true;
      reason: MeetingBotPolicyRequiredReason;
    }
  | {
      shouldRequestBot: false;
      reason: MeetingBotPolicyNotRequiredReason;
    };
