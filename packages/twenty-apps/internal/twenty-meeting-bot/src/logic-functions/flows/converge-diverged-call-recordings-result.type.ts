export type ConvergeDivergedCallRecordingsResult = {
  candidateCount: number;
  updatedCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
  requestedTranscriptCallRecordingIds: string[];
  unconvergeableCallRecordingIds: string[];
  skippedNotStartedCallRecordingIds: string[];
};
