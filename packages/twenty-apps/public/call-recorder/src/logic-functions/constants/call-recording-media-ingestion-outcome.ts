export const CallRecordingMediaIngestionOutcome = {
  INGESTED: 'ingested',
  TOO_LARGE: 'too-large',
  FAILED: 'failed',
} as const;

export type CallRecordingMediaIngestionOutcome =
  (typeof CallRecordingMediaIngestionOutcome)[keyof typeof CallRecordingMediaIngestionOutcome];
