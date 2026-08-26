export type GenerateCallRecordingSummariesForIdsResult = {
  generatedCallRecordingIds: string[];
  failedCallRecordingIds: string[];
  erroredCallRecordingIds: string[];
  skippedCallRecordingIds: string[];
  unavailableCallRecordingIds: string[];
};
