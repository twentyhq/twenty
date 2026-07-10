export type SyncStaleCallRecordingsResult = {
  candidateCount: number;
  updatedCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
  requestedTranscriptCallRecordingIds: string[];
  unsyncedCallRecordingIds: string[];
  skippedNotStartedCallRecordingIds: string[];
};
