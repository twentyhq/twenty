// Only the local record id crosses the continuation boundary; provider ids are
// re-resolved from the recording's own persisted state so they cannot be forged.
export type CallRecordingArtifactsImportRequest = {
  callRecordingId: string;
  requestedAt: string;
};
