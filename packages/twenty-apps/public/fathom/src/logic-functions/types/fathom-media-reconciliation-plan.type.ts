import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { type CallRecordingReference } from 'src/logic-functions/types/call-recording-reference.type';

export type FathomMediaReconciliationPlan = {
  callRecordingsToComplete: CallRecordingReference[];
  importGroups: Array<{
    connectedAccountId: string;
    callRecordingIdsToRequest: string[];
    downloadsToPoll: Array<{
      callRecordingId: string;
      downloadId: string;
    }>;
  }>;
  disconnectedAccountIds: string[];
};

export type FathomMediaReconciliationCandidate = CallRecordingMediaState & {
  status: string;
  updatedAt: string;
};

export type FathomMediaReconciliationRun = {
  startedAfter: string;
  staleBefore: string;
  afterId?: string;
};

export type FathomMediaReconciliationPage = {
  callRecordings: FathomMediaReconciliationCandidate[];
  hasNextPage: boolean;
};

export type DisconnectedFathomMediaReconciliationPlan = {
  callRecordingsToSettle: CallRecordingReference[];
  callRecordingsToSettleAndComplete: CallRecordingReference[];
  callRecordingsToSettleAndFail: CallRecordingReference[];
  callRecordingsToComplete: CallRecordingReference[];
  callRecordingsToFail: CallRecordingReference[];
};
