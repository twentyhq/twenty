// Mirrors the core CallRecording recordingRequestStatus select options; the app
// cannot import twenty-server, so the values are guarded by the schema
// integration test.
export enum CallRecordingRequestStatus {
  REQUESTED = 'REQUESTED',
  CANCELED = 'CANCELED',
}
