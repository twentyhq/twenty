export const CALL_RECORDING_FOR_ARTIFACTS_IMPORT_SELECTION = {
  id: true,
  status: true,
  startedAt: true,
  endedAt: true,
  externalBotId: true,
  externalRecordingId: true,
  callRecorderFailureReason: true,
  transcript: true,
  audio: { fileId: true },
  video: { fileId: true },
} as const;
