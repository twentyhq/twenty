// TODO: duplicated from core CallRecording select options — import once a shared package exists.
export const CALL_RECORDING_STATUS = {
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
} as const;

export type CallRecordingStatus =
  (typeof CALL_RECORDING_STATUS)[keyof typeof CALL_RECORDING_STATUS];

export const CALL_RECORDING_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
} as const;

export type CallRecordingRequestStatus =
  (typeof CALL_RECORDING_REQUEST_STATUS)[keyof typeof CALL_RECORDING_REQUEST_STATUS];
