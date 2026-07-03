export type GenerateMissingCallRecordingSummariesResult = {
  generatedCallRecordingIds: string[];
  failedCallRecordingIds: string[];
  skippedCallRecordingIds: string[];
  remainingCallRecordingIds: string[];
  continuationRequested: boolean;
};
