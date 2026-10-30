export type TeamsGenerateCallSummariesResult =
  | {
      outcome:
        | 'disabled'
        | 'nothing-selected'
        | 'no-teams-call-recordings'
        | 'too-many-call-recordings';
    }
  | {
      outcome: 'processed';
      summarizedCallRecordingIds: string[];
      unavailableCallRecordingIds: string[];
      failedCallRecordingIds: string[];
      skippedCallRecordingIds: string[];
    };
