import { type CallRecorderPolicyNotRequiredReason } from 'src/logic-functions/types/call-recorder-policy-not-required-reason.type';
import { type CallRecorderPolicyRequiredReason } from 'src/logic-functions/types/call-recorder-policy-required-reason.type';

export type CallRecorderPolicyResult =
  | {
      shouldRequestBot: true;
      reason: CallRecorderPolicyRequiredReason;
    }
  | {
      shouldRequestBot: false;
      reason: CallRecorderPolicyNotRequiredReason;
    };
