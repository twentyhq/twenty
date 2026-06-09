// Mirrors the core CallRecording recordingRequestStatus select options; the app
// cannot import twenty-server, so the values are guarded by the schema
// integration test.
export const CALL_RECORDING_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
  CANCELED: 'CANCELED',
} as const;

export type CallRecordingRequestStatus =
  (typeof CALL_RECORDING_REQUEST_STATUS)[keyof typeof CALL_RECORDING_REQUEST_STATUS];
