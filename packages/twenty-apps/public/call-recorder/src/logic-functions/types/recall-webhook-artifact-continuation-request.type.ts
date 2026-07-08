export type RecallWebhookArtifactContinuationRequest = {
  event: string;
  callRecordingId: string;
  externalBotId?: string;
  externalRecordingId?: string;
  transcriptId?: string;
  transcriptFailureSubCode?: string | null;
  requestedAt: string;
};
