// Mirrors the core CallRecording status select options; the app cannot import
// twenty-server, so the values are guarded by the schema integration test.
export enum CallRecordingStatus {
  SCHEDULED = 'SCHEDULED',
  JOINING = 'JOINING',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}
