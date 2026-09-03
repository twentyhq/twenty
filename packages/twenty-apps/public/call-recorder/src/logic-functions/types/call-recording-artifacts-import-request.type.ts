// Only the local record id crosses the continuation boundary; provider ids are
// re-resolved from the recording's own persisted state so they cannot be forged.
export type CallRecordingArtifactsImportRequest = {
  callRecordingId: string;
  requestedAt: string;
  // Counts deliveries of this request, including the ones this app re-enqueued
  // after losing the lease race, so retrying stays bounded.
  attempt: number;
};
