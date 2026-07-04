import { type CallRecorderReconciliationAction } from 'src/logic-functions/constants/call-recorder-reconciliation-action';

export type CallRecorderReconciliationResult =
  | {
      action:
        | typeof CallRecorderReconciliationAction.CREATED
        | typeof CallRecorderReconciliationAction.UPDATED
        | typeof CallRecorderReconciliationAction.CANCELED;
      realMeetingKey: string;
      callRecordingId: string;
    }
  | {
      action: typeof CallRecorderReconciliationAction.SKIPPED;
      realMeetingKey: string;
      callRecordingId: string | null;
    }
  | {
      action: typeof CallRecorderReconciliationAction.FAILED;
      realMeetingKey: string;
      errorMessage: string;
    };
