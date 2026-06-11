// Mirrors the core select options; guarded by the schema integration test.
export enum CallRecordingStatus {
  SCHEDULED = 'SCHEDULED',
  JOINING = 'JOINING',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}
