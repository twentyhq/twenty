export type GenerateMissingCallRecordingSummariesResult = {
  generatedCallRecordingIds: string[];
  failedCallRecordingIds: string[];
  erroredCallRecordingIds: string[];
  skippedCallRecordingIds: string[];
  remainingCallRecordingIds: string[];
  continuationRequested: boolean;
};
