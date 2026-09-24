import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { type FathomRecordingImportReference } from 'src/logic-functions/types/fathom-recording-import-reference.type';

export type FathomMediaReconciliationPlan = {
  callRecordingsToComplete: FathomRecordingImportReference[];
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
  callRecordingsToSettle: FathomRecordingImportReference[];
  callRecordingsToSettleAndComplete: FathomRecordingImportReference[];
  callRecordingsToSettleAndFail: FathomRecordingImportReference[];
  callRecordingsToComplete: FathomRecordingImportReference[];
  callRecordingsToFail: FathomRecordingImportReference[];
};
